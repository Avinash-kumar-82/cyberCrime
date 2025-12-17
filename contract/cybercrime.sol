// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* =========================
        ERC-4337 IMPORTS
========================= */
import "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/main/contracts/core/BaseAccount.sol";
import "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/main/contracts/core/EntryPoint.sol";

/* =========================
       CYBER CRIME SYSTEM
========================= */
contract CyberCrimeSystem is BaseAccount {
    /* =========================
        ERC-4337 CONFIG
    ========================== */
    //0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 contract address of Entrypoint
    EntryPoint private immutable _entryPoint;

    address public government;

    modifier onlyGovernment() {
        require(
            msg.sender == government || msg.sender == address(_entryPoint),
            "Not authorized"
        );
        _;
    }

    constructor(address _government, EntryPoint ep) {
        government = _government;
        _entryPoint = ep;
    }

    /* =========================
        ERC-4337 OVERRIDES
    ========================== */

    /* A nonce is a number that tracks how many transactions or operations an account has executed.
     It ensures each operation is unique and prevents replay attacks (someone re-submitting the same transaction).*/

    uint256 private _nonce;

    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    } // returning contract address of entrypoint it's abstract from BaseAccount

    function nonce() public view override returns (uint256) {
        return _nonce; // return nonce value how much users had complained
    }

    function _validateSignature(
        UserOperation calldata,
        bytes32
    ) internal pure override returns (uint256) {
        return 0; // always valid (demo mode)
    }

    function _validateAndUpdateNonce(
        UserOperation calldata userOp
    ) internal override {
        require(userOp.nonce == _nonce, "Invalid nonce");
        _nonce++;
    }

    /* =========================
        FIR MODELS
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
        bytes32 anonymousUserId;
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

    uint256 public firCounter;
    mapping(uint256 => FIR) private firs;
    mapping(bytes32 => uint256) public trackingToFIR;
    /* =========================
        EVENTS
    ========================== */
    event FIRRegistered(uint256 firId, bytes32 trackingId);
    event CaseStatusUpdated(uint256 firId, CaseStatus status);

    /* =========================
        REGISTER FIR
    ========================== */
    function registerFIR(
        FIRType firType,
        string[] calldata accusedData,
        bytes32[] calldata evidenceHash,
        string[] calldata description,
        uint256 crimeDate
    ) external onlyGovernment {
        // ✅ Financial fraud validation: must report within 72 hours
        if (firType == FIRType.FINANCIAL_THEFT) {
            require(
                block.timestamp - crimeDate <= 72 hours,
                "Rejected: Financial fraud reported after 72 hours"
            );
        }
        uint256 requestId = ++firCounter;
        FIR storage f = firs[requestId];
        // Generate anonymous user ID
        bytes32 anonymousUserId = keccak256(
            abi.encodePacked(
                firCounter, // incrementing FIR ID
                msg.sender, // caller (government/police)
                block.prevrandao // block randomness (harder to predict than timestamp)
            )
        );
        bytes32 trackingId = keccak256(
            abi.encodePacked(
                firCounter,
                anonymousUserId,
                msg.sender,
                block.prevrandao
            )
        );

        f.id = firCounter;
        f.anonymousUserId = anonymousUserId;
        f.trackingId = trackingId;
        f.firType = firType;
        f.crimeDate = crimeDate;
        f.firDate = block.timestamp;
        f.status = CaseStatus.FIR_SUBMITTED;

        // ✅ COPY ARRAYS SAFELY
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
        emit FIRRegistered(firCounter, trackingId);
    }

    /* =======================
                VALIDATE CASE
       ========================*/

    function validateCase(
        uint256 firId,
        bool isValid,
        string calldata remark
    ) external onlyGovernment {
        FIR storage f = firs[firId];

        require(f.id != 0, "FIR does not exist");
        require(f.status == CaseStatus.FIR_SUBMITTED, "FIR already processed");

        if (isValid) {
            f.status = CaseStatus.FIR_VERIFIED;
        } else {
            f.status = CaseStatus.FIR_REJECTED;
        }

        f.policeRemarks.push(remark);

        emit CaseStatusUpdated(firId, f.status);
    }
    /* =========================
        TRACK CASE
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
        POLICE UPDATE
    ========================== */
    function updateCaseStatus(
        uint256 firId,
        CaseStatus newStatus,
        string[] calldata remarks
    ) external onlyGovernment {
        FIR storage f = firs[firId];
        f.status = newStatus;

        for (uint i = 0; i < remarks.length; i++) {
            f.policeRemarks.push(remarks[i]);
        }

        emit CaseStatusUpdated(firId, newStatus);
    }
}
