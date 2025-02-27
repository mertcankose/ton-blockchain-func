import { useEffect, useState } from 'react';
import { Vesting } from '../contracts/Vesting';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonConnect } from './useTonConnect';
import { Address, OpenedContract } from '@ton/core';
import { formatUnits } from '../helpers/formatUnits';

export function useVestingContract() {
  const client = useTonClient();
  const { sender } = useTonConnect();
  
  const [vestingData, setVestingData] = useState<any>(null);
  const [lockedAmount, setLockedAmount] = useState<string>('0');
  const [unlockedAmount, setUnlockedAmount] = useState<string>('0');
  const [claimedAmount, setClaimedAmount] = useState<string>('0');
  const [claimableAmount, setClaimableAmount] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const vestingContract = useAsyncInitialize(async () => {
    if (!client) return;
    try {
      const contract = new Vesting(
        Address.parse("EQB5Wh1nLsVBru9lHcrzlUMv40hAR3pu6YkY0KoU6nog9urI")
      );
      return client.open(contract) as OpenedContract<Vesting>;
    } catch (err) {
      console.error('Error opening contract:', err);
      setError('Invalid contract address');
      return null;
    }
  }, [client]);

  console.log("Vesting Contract:", vestingContract);

  // Veri çekme fonksiyonu
  const fetchData = async () => {
    if (!vestingContract) return;
    
    setLoading(true);
    setError(null);
    setIsRefreshing(true);
    
    try {
      // Fetch vesting data
      const data = await vestingContract.getVestingData();
      console.log("Vesting Data:", data);
      setVestingData(data);
      
      // Fetch locked amount
      const locked = await vestingContract.getCurrentLockedAmount();
      setLockedAmount(formatUnits(locked, 9));
      
      // Fetch unlocked amount
      const unlocked = await vestingContract.getCurrentUnlockedAmount();
      setUnlockedAmount(formatUnits(unlocked, 9));
      
      // Fetch claimed amount
      const claimed = await vestingContract.getClaimedAmount();
      setClaimedAmount(formatUnits(claimed, 9));
      
      // Fetch claimable amount
      const claimable = await vestingContract.getClaimableAmount();
      setClaimableAmount(formatUnits(claimable, 9));
    } catch (err) {
      console.error('Error fetching vesting data:', err);
      setError('Failed to fetch vesting data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Sadece contract değiştiğinde bir kez veri çek
  useEffect(() => {
    if (vestingContract) {
      fetchData();
    }
  }, [vestingContract]);

  return {
    vestingData,
    lockedAmount,
    unlockedAmount,
    claimedAmount,
    claimableAmount,
    loading,
    error,
    isRefreshing,
    address: vestingContract?.address.toString(),
    
    // Manuel yenileme fonksiyonu
    refreshData: fetchData,
    
    // Actions
    claimUnlocked: (jettonWalletAddress: string) => {
      if (!vestingContract) return;
      return vestingContract.claimUnlocked(sender, {
        jettonWalletAddress: Address.parse(jettonWalletAddress),
      });
    },
    
    sendJettons: (toAddress: string, jettonAmount: bigint, forwardTonAmount: bigint, jettonWalletAddress: string) => {
      if (!vestingContract) return;
      return vestingContract.sendJettons(sender, {
        toAddress: Address.parse(toAddress),
        jettonAmount,
        forwardTonAmount,
        jettonWalletAddress: Address.parse(jettonWalletAddress),
      });
    },
    
    addWhitelist: (address: string) => {
      if (!vestingContract) return;
      return vestingContract.addWhitelist(sender, Address.parse(address));
    },
  };
} 