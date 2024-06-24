import { useEffect, useState } from "react";
import { useTonClient } from "./useTonClient";
import { useAyncInitialize } from "./useAsyncInitialize";
import Counter from "../contracts/counter";
import { Address, OpenedContract } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

export function useCounterContract() {
  const client = useTonClient();
  const [val, setVal] = useState<null | string>();
  const { sender } = useTonConnect();

  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const counterContract = useAyncInitialize(async () => {
    if (!client) return;
    const contract = new Counter(
      Address.parse("EQCkCGatPcWIUxN6--TxJsMgRakrVKi0ESVzmMidy0BiTOQY")
    );

    return client.open(contract) as OpenedContract<Counter>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!counterContract) return;
      setVal(null);
      const val = await counterContract.getCounter();
      setVal(val.toString());
      await sleep(10000);
      getValue();
    }

    getValue();
  }, [counterContract]);

  return {
    value: val,
    address: counterContract?.address.toString(),
    sendIncrement: () => {
      return counterContract?.sendIncrement(sender);
    },
  };
}
