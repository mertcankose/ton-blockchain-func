import { useEffect, useState } from 'react';
import { TestContract } from '../contracts/counter';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonConnect } from './useTonConnect';
import { Address, OpenedContract } from '@ton/core';

export function useCounterContract() {
    const client = useTonClient();
    const [val, setVal] = useState<null | string>();
    const { sender } = useTonConnect();
  
    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
  
    const counterContract = useAsyncInitialize(async () => {
      if (!client) return;
      const contract = new TestContract(
        Address.parse('EQDOz4DsjrCmR4tE12LSVX44jeCXnytQ6SL4cDb-jS-xslch')
      );
      return client.open(contract) as OpenedContract<TestContract>;
    }, [client]);
  
    useEffect(() => {
      let mounted = true;
  
      async function getValue() {
        while (mounted) {
          if (!counterContract) return;
          
          try {
            const newVal = await counterContract.getCurrentValue();
            if (mounted) {
              setVal(newVal.toString());
            }
          } catch (error) {
            console.error('Error fetching value:', error);
          }
  
          await sleep(4000);
        }
      }
  
      getValue();
  
      return () => {
        mounted = false;
      };
    }, [counterContract]);
  
    return {
      value: val,
      address: counterContract?.address.toString(),
      sendIncrement: () => {
        return counterContract?.sendIncreaseValue(sender, {
          value: BigInt(0.05 * 1000000000),
          increaseBy: 1,
        });
      },
    };
  }

