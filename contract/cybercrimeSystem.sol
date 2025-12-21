// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// contract Address --> 0x079199304A7E02DBC719415d4e12854E7C2de6bf
contract CyberCrimeSystem {
    /*//////////////////////////////////////////////////////////////
                               ROLES
    //////////////////////////////////////////////////////////////*/

    address public government;

    mapping(address => bool) private policeWallets;

    modifier onlyGovernment() {
        require(msg.sender == government, "Not government");
        _;
    }

    modifier onlyPolice() {
        require(policeWallets[msg.sender], "Not police");
        _;
    }

    modifier onlyPoliceOrGovernment() {
        require(
            msg.sender == government || policeWallets[msg.sender],
            "Not authorized"
        );
        _;
    }

    constructor() {
        government = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                       ROLE READERS (FRONTEND)
    //////////////////////////////////////////////////////////////*/

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
    address[] private policeList;
    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/

    event FIRRegistered(
        uint256 indexed firId,
        address indexed user,
        bytes32 trackingId
    );
    event CaseStatusUpdated(uint256 indexed firId, CaseStatus status);
    event PoliceWalletAdded(address indexed police);
    event PoliceWalletRemoved(address indexed police);
    event FIRAssigned(uint256 indexed firId, address indexed police);

    /*//////////////////////////////////////////////////////////////
                       POLICE MANAGEMENT (GOVERNMENT)
    //////////////////////////////////////////////////////////////*/

    function addPoliceWallet(address police) external onlyGovernment {
        require(police != address(0), "Zero address");
        require(!policeWallets[police], "Already police");

        policeWallets[police] = true;
        policeList.push(police);

        emit PoliceWalletAdded(police);
    }
    function removePoliceWallet(address police) external onlyGovernment {
        require(policeWallets[police], "Not police");

        policeWallets[police] = false;

        // remove from array (swap & pop)
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
        FIRType firType,
        string[] calldata accusedData,
        bytes32[] calldata evidenceHash,
        string[] calldata description,
        uint256 crimeDate
    ) external {
        require(!policeWallets[msg.sender], "Police cannot file FIR");

        if (firType == FIRType.FINANCIAL_THEFT) {
            require(
                block.timestamp - crimeDate <= 72 hours,
                "Report within 72 hours"
            );
        }

        firCounter++;

        bytes32 trackingId = keccak256(
            abi.encodePacked(firCounter, msg.sender, block.timestamp)
        );

        FIR storage f = firs[firCounter];
        f.id = firCounter;
        f.user = msg.sender;
        f.trackingId = trackingId;
        f.firType = firType;
        f.crimeDate = crimeDate;
        f.firDate = block.timestamp;
        f.status = CaseStatus.FIR_SUBMITTED;

        for (uint i; i < accusedData.length; i++) {
            f.accusedData.push(accusedData[i]);
        }
        for (uint i; i < evidenceHash.length; i++) {
            f.evidenceHash.push(evidenceHash[i]);
        }
        for (uint i; i < description.length; i++) {
            f.description.push(description[i]);
        }

        trackingToFIR[trackingId] = firCounter;

        FIRSummary memory summary = FIRSummary(
            firCounter,
            firType,
            CaseStatus.FIR_SUBMITTED,
            trackingId,
            address(0)
        );

        userFIRs[msg.sender].push(summary);
        policeFIRs.push(summary);

        emit FIRRegistered(firCounter, msg.sender, trackingId);
    }

    /*//////////////////////////////////////////////////////////////
                      GOVERNMENT → ASSIGN POLICE
    //////////////////////////////////////////////////////////////*/

    function assignFIRToPolice(
        uint256 firId,
        address police
    ) external onlyGovernment {
        require(policeWallets[police], "Invalid police");

        FIR storage f = firs[firId];
        require(f.id != 0, "FIR not found");

        f.assignedPolice = police;
        f.status = CaseStatus.CASE_UNDERPROCESS;

        for (uint i; i < policeFIRs.length; i++) {
            if (policeFIRs[i].firId == firId) {
                policeFIRs[i].assignedPolice = police;
                policeFIRs[i].status = CaseStatus.CASE_UNDERPROCESS;
                break;
            }
        }

        emit FIRAssigned(firId, police);
        emit CaseStatusUpdated(firId, CaseStatus.CASE_UNDERPROCESS);
    }

    /*//////////////////////////////////////////////////////////////
                         POLICE ACTIONS
    //////////////////////////////////////////////////////////////*/

    function verifyOrRejectFIR(
        uint256 firId,
        bool approve
    ) external onlyPolice {
        FIR storage f = firs[firId];
        require(f.id != 0, "FIR not found");

        f.status = approve ? CaseStatus.FIR_VERIFIED : CaseStatus.FIR_REJECTED;

        emit CaseStatusUpdated(firId, f.status);
    }

    function addPoliceRemark(
        uint256 firId,
        string calldata remark
    ) external onlyPolice {
        FIR storage f = firs[firId];
        f.policeRemarks.push(remark);
    }

    function closeCase(uint256 firId) external onlyPolice {
        FIR storage f = firs[firId];
        f.status = CaseStatus.CASE_CLOSED;
        emit CaseStatusUpdated(firId, CaseStatus.CASE_CLOSED);
    }

    /*//////////////////////////////////////////////////////////////
                        DASHBOARD READ FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getAllFIRsForPolice()
        external
        view
        onlyPoliceOrGovernment
        returns (FIRSummary[] memory)
    {
        return policeFIRs;
    }

    function getMyFIRs() external view returns (FIRSummary[] memory) {
        return userFIRs[msg.sender];
    }

    function getFIRDetails(
        uint256 firId
    ) external view onlyPoliceOrGovernment returns (FIR memory) {
        FIR memory f = firs[firId];
        require(f.id != 0, "FIR not found");
        return f;
    }
    function getAllPolice()
        external
        view
        onlyGovernment
        returns (address[] memory)
    {
        return policeList;
    }
    function getMyRole(address user) external view returns (string memory) {
        if (user == government) return "government";
        if (policeWallets[user]) return "police";
        return "user";
    }
}
