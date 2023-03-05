// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ByteHasher } from './helpers/ByteHasher.sol';
import { IWorldID } from './interfaces/IWorldID.sol';

contract CommunityPets is ERC721URIStorage {

  using ByteHasher for bytes;
  using Counters for Counters.Counter;
  Counters.Counter public _totalNFTs;
  uint public _totalFundraisers = 0;

  mapping(uint => Fundraiser) public fundraiserList;

  /// @notice Thrown when attempting to reuse a nullifier
    error InvalidNullifier();

    /// @dev The WorldID instance that will be used for verifying proofs
    IWorldID internal immutable worldId = "0xABB70f7F39035586Da57B3c8136035f87AC0d2Aa";

    /// @dev The WorldID group ID (1)
    uint256 internal immutable groupId = 1;

    /// @dev Whether a nullifier hash has been used already. Used to prevent double-signaling
    mapping(uint256 => bool) internal nullifierHashes;



  struct Fundraiser {
    uint id;
    string cid;
    uint targetAmmount;
    uint totalDonations;
    address organizer;
  }

  event FundraiserCreated (
    uint id,
    string cid,
    uint targetAmmount,
    address organizer
  );

  constructor() ERC721("Community Pets", "CP") {}
  // calldata is read only, use for funct inputs as params
  function createFoundraiser(string calldata _cid, uint _targetAmmount, address input, uint256 root, uint256 nullifierHash, uint256[8] calldata proof) public {
    // first, we make sure this person hasn't done this before
    if (nullifierHashes[nullifierHash]) revert InvalidNullifier();
    // then, we verify they're registered with WorldID, and the input they've provided is correct
    worldId.verifyProof(
      root,
      groupId,
      abi.encodePacked(input).hashToField(),
      nullifierHash,
      abi.encodePacked(address(this)).hashToField(),
      proof
  );
  // finally, we record they've done this, so they can't do it again (proof of uniqueness)
  nullifierHashes[nullifierHash] = true;

  fundraiserList[_totalFundraisers] = Fundraiser(_totalFundraisers, _cid, _targetAmmount, 0, msg.sender);
    emit FundraiserCreated(_totalFundraisers, _cid, _targetAmmount, msg.sender);
    _totalFundraisers++;
  }

  function donate(uint _donationId, uint _donationAmmount) public {
    Fundraiser storage _postFoundraise = fundraiserList[_donationId];
    _postFoundraise.totalDonations += _donationAmmount;
  }

  function getAllFundraisers() public view returns (Fundraiser[] memory) {
      Fundraiser[] memory fundraiserArray = new Fundraiser[](_totalFundraisers);

      for (uint i = 0; i < _totalFundraisers; i++) {
          Fundraiser storage currentItem = fundraiserList[i];
          fundraiserArray[i] = currentItem;
      }
      return fundraiserArray;
  }

}

