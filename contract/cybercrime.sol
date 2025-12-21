// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CyberCrimeSystem {
    /*//////////////////////////////////////////////////////////////
                               RELAYER
    //////////////////////////////////////////////////////////////*/

    address public trustedRelayer;
    address public government;

    modifier onlyRelayer() {
        require(msg.sender == trustedRelayer, "Only relayer");
        _;
    }

    modifier onlyGovernment(address user) {
        require(user == government, "Not government");
        _;
    }

    modifier onlyPolice(address user) {
        require(policeWallets[user], "Not police");
        _;
    }

    modifier onlyPoliceOrGovernment(address user) {
        require(user == government || policeWallets[user], "Not authorized");
        _;
    }

    constructor(address _relayer) {
        trustedRelayer = _relayer;
        government = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                               ROLES
    //////////////////////////////////////////////////////////////*/

    mapping(address => bool) private policeWallets;
    address[] private policeList;

    function isPolice(address user) external view returns (bool) {
        return policeWallets[user];
    }

    function isGovernment(address user) external view returns (bool) {
        return user == government;
    }

    /*//////////////////////////////////////////////////////////////
                          ENUMS & STRUCTS
    //////////////////////////////////////////////////////////////*/

    enum FIRType {
        NOT_SPECIFIED,
        FRAUD_CALL,
        OTP_SCAMS,
        ONLINE_HARASSMENT,
        FINANCIAL_THEFT
    }

    enum CaseStatus {
        FIR_SUBMITTED,
        FIR_VERIFIED,
        FIR_REJECTED,
        CASE_UNDERPROCESS,
        CASE_CLOSED
    }

    struct FIR {
        uint256 id;
        address user;
        bytes32 trackingId;
        FIRType firType;
        string[] accusedData;
        bytes32[] evidenceHash;
        string[] description;
        uint256 crimeDate;
        uint256 firDate;
        CaseStatus status;
        string[] policeRemarks;
        address assignedPolice;
    }

    struct FIRSummary {
        uint256 firId;
        FIRType firType;
        CaseStatus status;
        bytes32 trackingId;
        address assignedPolice;
    }

    /*//////////////////////////////////////////////////////////////
                               STORAGE
    //////////////////////////////////////////////////////////////*/

    uint256 public firCounter;
    mapping(uint256 => FIR) private firs;
    mapping(bytes32 => uint256) public trackingToFIR;
    mapping(address => FIRSummary[]) public userFIRs;
    FIRSummary[] private policeFIRs;

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    event FIRRegistered(uint256 firId, address user, bytes32 trackingId);
    event CaseStatusUpdated(uint256 firId, CaseStatus status);
    event PoliceWalletAdded(address police);
    event PoliceWalletRemoved(address police);
    event FIRAssigned(uint256 firId, address police);

    /*//////////////////////////////////////////////////////////////
                     GOVERNMENT → POLICE MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function addPoliceWallet(
        address govt,
        address police
    ) external onlyRelayer onlyGovernment(govt) {
        require(!policeWallets[police], "Already police");
        policeWallets[police] = true;
        policeList.push(police);
        emit PoliceWalletAdded(police);
    }

    function removePoliceWallet(
        address govt,
        address police
    ) external onlyRelayer onlyGovernment(govt) {
        policeWallets[police] = false;
        for (uint i = 0; i < policeList.length; i++) {
            if (policeList[i] == police) {
                policeList[i] = policeList[policeList.length - 1];
                policeList.pop();
                break;
            }
        }
        emit PoliceWalletRemoved(police);
    }

    /*//////////////////////////////////////////////////////////////
                          REGISTER FIR (USER)
    //////////////////////////////////////////////////////////////*/

    function registerFIR(
        address user,
        FIRType firType,
        string[] calldata accusedData,
        bytes32[] calldata evidenceHash,
        string[] calldata description,
        uint256 crimeDate
    ) external onlyRelayer {
        require(!policeWallets[user], "Police cannot file FIR");

        if (firType == FIRType.FINANCIAL_THEFT) {
            require(block.timestamp - crimeDate <= 72 hours, "Late report");
        }

        firCounter++;
        bytes32 trackingId = keccak256(
            abi.encodePacked(firCounter, user, block.timestamp)
        );

        FIR storage f = firs[firCounter];
        f.id = firCounter;
        f.user = user;
        f.trackingId = trackingId;
        f.firType = firType;
        f.crimeDate = crimeDate;
        f.firDate = block.timestamp;
        f.status = CaseStatus.FIR_SUBMITTED;

        for (uint i; i < accusedData.length; i++)
            f.accusedData.push(accusedData[i]);
        for (uint i; i < evidenceHash.length; i++)
            f.evidenceHash.push(evidenceHash[i]);
        for (uint i; i < description.length; i++)
            f.description.push(description[i]);

        FIRSummary memory summary = FIRSummary(
            firCounter,
            firType,
            CaseStatus.FIR_SUBMITTED,
            trackingId,
            address(0)
        );

        userFIRs[user].push(summary);
        policeFIRs.push(summary);

        emit FIRRegistered(firCounter, user, trackingId);
    }

    /*//////////////////////////////////////////////////////////////
                         GOVERNMENT → ASSIGN FIR
    //////////////////////////////////////////////////////////////*/

    function assignFIRToPolice(
        address govt,
        uint256 firId,
        address police
    ) external onlyRelayer onlyGovernment(govt) {
        FIR storage f = firs[firId];
        f.assignedPolice = police;
        f.status = CaseStatus.CASE_UNDERPROCESS;

        emit FIRAssigned(firId, police);
        emit CaseStatusUpdated(firId, CaseStatus.CASE_UNDERPROCESS);
    }

    /*//////////////////////////////////////////////////////////////
                           POLICE ACTIONS
    //////////////////////////////////////////////////////////////*/

    function verifyOrRejectFIR(
        address police,
        uint256 firId,
        bool approve
    ) external onlyRelayer onlyPolice(police) {
        FIR storage f = firs[firId];
        f.status = approve ? CaseStatus.FIR_VERIFIED : CaseStatus.FIR_REJECTED;
        emit CaseStatusUpdated(firId, f.status);
    }

    function closeCase(
        address police,
        uint256 firId
    ) external onlyRelayer onlyPolice(police) {
        firs[firId].status = CaseStatus.CASE_CLOSED;
        emit CaseStatusUpdated(firId, CaseStatus.CASE_CLOSED);
    }

    /*//////////////////////////////////////////////////////////////
                             READ FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getMyFIRs(
        address user
    ) external view returns (FIRSummary[] memory) {
        return userFIRs[user];
    }

    function getAllFIRsForPolice(
        address user
    ) external view onlyPoliceOrGovernment(user) returns (FIRSummary[] memory) {
        return policeFIRs;
    }

    function getAllPolice() external view returns (address[] memory) {
        return policeList;
    }
}
