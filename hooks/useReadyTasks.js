import { useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { listCandidateTasks, listAllDepsForOwner } from "../data/list";
import { buildReadyList } from "../logic/ready";

export function useReadyTasks() {
  const [ready, setReady] = useState([]);
  useEffect(() => {
    (async () => {
      const user = await account.get();
      const [{ documents: tasks }, { documents: deps }] = await Promise.all([
        listCandidateTasks(user.$id),
        listAllDepsForOwner(user.$id),
      ]);
      setReady(buildReadyList(tasks, deps));
    })();
  }, []);
  return ready;
}
