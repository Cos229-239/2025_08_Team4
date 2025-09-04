export function buildReadyList(tasks, depsDocs) {
  const taskById = new Map(tasks.map(t => [t.$id, t]));
  const depsByTask = new Map();
  for (const d of depsDocs) {
    if (!depsByTask.has(d.taskId)) depsByTask.set(d.taskId, []);
    depsByTask.get(d.taskId).push(d);
  }
  const now = new Date();
  const isReady = (t) => {
    if (t.snoozeUntil && new Date(t.snoozeUntil) > now) return false;
    if (t.startDate && new Date(t.startDate) > now) return false;
    if (!["todo","in_progress","waiting","blocked"].includes(t.status)) return false;
    for (const e of (depsByTask.get(t.$id) || [])) {
      const blocker = taskById.get(e.dependsOnId);
      if (!blocker || blocker.status !== "done") return false;
      const lag = e.lagMinutes || 0;
      if (lag > 0) {
        const doneAt = blocker.completedAt ? new Date(blocker.completedAt) : null;
        if (!doneAt || new Date(doneAt.getTime() + lag*60000) > now) return false;
      }
    }
    return true;
  };
  return tasks.filter(isReady);
}
