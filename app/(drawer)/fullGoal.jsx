// app/drawer/fullGoal.jsx
import React from "react";
import GoalDetailsScreen from "../../components/GoalDetailsScreen";
import { getGoal, upsertGoal } from "../../lib/goalRepo"; // make sure you added this file

export default function FullGoal({ route }) {
  const goalId = route?.params?.goalId;
  const [initialGoal, setInitialGoal] = React.useState(null);
  const [loading, setLoading] = React.useState(!!goalId);

  React.useEffect(() => {
    let on = true;
    (async () => {
      if (!goalId) return;
      try {
        const doc = await getGoal(goalId);
        if (on) setInitialGoal(doc);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [goalId]);

  if (loading) return null; // or a spinner

  return (
    <GoalDetailsScreen
      initialGoal={initialGoal || {}}
      onSave={async (payload) => {
        const saved = await upsertGoal(payload);
        return saved;
      }}
    />
  );
}
