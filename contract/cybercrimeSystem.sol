// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// contract Address --> 0x079199304A7E02DBC719415d4e12854E7C2de6bf
contract CyberCrimeSystem {
    address public government;

    modifier onlyGovernment() {
        require(msg.sender == government, "Not authorized");
        _;
    }

    constructor() {
        government = msg.sender;
    }

    /* =========================
       ENUMS, STRUCTS, STORAGE
    ========================== */
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
        address assignedPolice; // ✅ Added field
    }

    struct FIRSummary {
        uint256 firId;
        FIRType firType;
        CaseStatus status;
        bytes32 trackingId;
        address assignedPolice;
    }

    uint256 public firCounter;
    mapping(uint256 => FIR) private firs;
    mapping(bytes32 => uint256) public trackingToFIR;
    mapping(address => FIRSummary[]) private userFIRs;
    FIRSummary[] private policeFIRs;

    mapping(address => bool) public policeWallets; // List of police wallets

    /* =========================
       EVENTS
    ========================== */
    event FIRRegistered(
        uint256 indexed firId,
        address indexed user,
        bytes32 trackingId
    );
    event CaseStatusUpdated(uint256 indexed firId, CaseStatus status);
    event PoliceWalletAdded(address indexed police);
    event PoliceWalletRemoved(address indexed police);
    event FIRAssigned(uint256 indexed firId, address indexed police);

    /* =========================
       ADD/REMOVE POLICE (GOVERNMENT)
    ========================== */
    function addPoliceWallet(address police) external onlyGovernment {
        require(police != address(0), "Zero address");
        policeWallets[police] = true;
        emit PoliceWalletAdded(police);
    }

    function removePoliceWallet(address police) external onlyGovernment {
        policeWallets[police] = false;
        emit PoliceWalletRemoved(police);
    }

    /* =========================
       REGISTER FIR (USER)
    ========================== */
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
                "Financial fraud must be reported within 72 hours"
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

        for (uint i = 0; i < accusedData.length; i++)
            f.accusedData.push(accusedData[i]);
        for (uint i = 0; i < evidenceHash.length; i++)
            f.evidenceHash.push(evidenceHash[i]);
        for (uint i = 0; i < description.length; i++)
            f.description.push(description[i]);

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

    /* =========================
       ASSIGN CASE TO POLICE (GOVERNMENT)
    ========================== */
    function assignFIRToPolice(
        uint256 firId,
        address police
    ) external onlyGovernment {
        require(policeWallets[police], "Not a valid police wallet");
        FIR storage f = firs[firId];
        require(f.id != 0, "FIR not found");

        f.assignedPolice = police;

        // Update policeFIRs summary
        for (uint i = 0; i < policeFIRs.length; i++) {
            if (policeFIRs[i].firId == firId) {
                policeFIRs[i].assignedPolice = police;
                break;
            }
        }

        emit FIRAssigned(firId, police);
    }

    /* =========================
       POLICE DASHBOARD
    ========================== */
    function getAllFIRsForPolice() external view returns (FIRSummary[] memory) {
        return policeFIRs;
    }

    function getFIRDetails(uint256 firId) external view returns (FIR memory) {
        FIR memory f = firs[firId];
        require(f.id != 0, "FIR not found");
        return f;
    }
}
