// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CyberCrimeSystem {
    /* =========================
        GOVERNMENT / POLICE
    ========================== */
    address public government;

    modifier onlyGovernment() {
        require(msg.sender == government, "Not authorized");
        _;
    }

    modifier onlyPolice() {
        require(policeWallets[msg.sender], "Not authorized as police");
        _;
    }

    constructor() {
        government = msg.sender;
    }

    /* =========================
        ENUMS
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

    /* =========================
        STRUCTS
    ========================== */
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
    }

    struct FIRSummary {
        uint256 firId;
        FIRType firType;
        CaseStatus status;
        bytes32 trackingId;
    }

    /* =========================
        STORAGE
    ========================== */
    uint256 public firCounter;

    mapping(uint256 => FIR) private firs;
    mapping(bytes32 => uint256) public trackingToFIR;

    // User wallet → FIR summaries
    mapping(address => FIRSummary[]) private userFIRs;

    // Police dashboard FIR summaries
    FIRSummary[] private policeFIRs;

    // Police wallets
    mapping(address => bool) public policeWallets;
    address[] private policeList;

    /* =========================
        EVENTS
    ========================== */
    event FIRRegistered(
        uint256 indexed firId,
        address indexed user,
        bytes32 trackingId
    );
    event CaseStatusUpdated(uint256 indexed firId, CaseStatus status);
    event PoliceAdded(address indexed policeAddress);
    event PoliceRemoved(address indexed policeAddress);

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
        require(msg.sender != government, "Police cannot file FIR");
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

        for (uint i = 0; i < accusedData.length; i++) {
            f.accusedData.push(accusedData[i]);
        }

        for (uint i = 0; i < evidenceHash.length; i++) {
            f.evidenceHash.push(evidenceHash[i]);
        }

        for (uint i = 0; i < description.length; i++) {
            f.description.push(description[i]);
        }

        trackingToFIR[trackingId] = firCounter;

        FIRSummary memory summary = FIRSummary({
            firId: firCounter,
            firType: firType,
            status: CaseStatus.FIR_SUBMITTED,
            trackingId: trackingId
        });

        userFIRs[msg.sender].push(summary);
        policeFIRs.push(summary);

        emit FIRRegistered(firCounter, msg.sender, trackingId);
    }

    /* =========================
        USER DASHBOARD
    ========================== */
    function getMyFIRs() external view returns (FIRSummary[] memory) {
        return userFIRs[msg.sender];
    }

    function getFIRDetails(uint256 firId) external view returns (FIR memory) {
        FIR memory f = firs[firId];
        require(f.id != 0, "FIR not found");
        require(
            msg.sender == f.user ||
                msg.sender == government ||
                policeWallets[msg.sender],
            "Unauthorized"
        );
        return f;
    }

    /* =========================
        PUBLIC TRACKING
    ========================== */
    function trackCase(
        bytes32 trackingId
    )
        external
        view
        returns (
            uint256 firId,
            FIRType firType,
            CaseStatus status,
            string[] memory policeRemarks
        )
    {
        uint256 id = trackingToFIR[trackingId];
        require(id != 0, "Invalid Tracking ID");

        FIR storage f = firs[id];
        return (f.id, f.firType, f.status, f.policeRemarks);
    }

    /* =========================
        POLICE DASHBOARD
    ========================== */
    function getAllFIRsForPolice()
        external
        view
        onlyPolice
        returns (FIRSummary[] memory)
    {
        return policeFIRs;
    }

    function updateCaseStatus(
        uint256 firId,
        CaseStatus newStatus,
        string calldata remark
    ) external onlyPolice {
        FIR storage f = firs[firId];
        require(f.id != 0, "FIR not found");

        f.status = newStatus;
        f.policeRemarks.push(remark);

        // 🔄 Update police summary
        for (uint i = 0; i < policeFIRs.length; i++) {
            if (policeFIRs[i].firId == firId) {
                policeFIRs[i].status = newStatus;
                break;
            }
        }

        emit CaseStatusUpdated(firId, newStatus);
    }

    /* =========================
        GOVERNMENT: MANAGE POLICE
    ========================== */
    function addPolice(address _police) external onlyGovernment {
        require(_police != address(0), "Invalid address");
        require(!policeWallets[_police], "Already a police");

        policeWallets[_police] = true;
        policeList.push(_police);

        emit PoliceAdded(_police);
    }

    function removePolice(address _police) external onlyGovernment {
        require(policeWallets[_police], "Not a police");

        policeWallets[_police] = false;

        // Remove from list
        for (uint i = 0; i < policeList.length; i++) {
            if (policeList[i] == _police) {
                policeList[i] = policeList[policeList.length - 1];
                policeList.pop();
                break;
            }
        }

        emit PoliceRemoved(_police);
    }

    function getAllPolice() external view returns (address[] memory) {
        return policeList;
    }
}
