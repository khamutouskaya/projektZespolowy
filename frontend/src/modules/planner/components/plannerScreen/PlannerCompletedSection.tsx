import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PlannerTaskCard from "./PlannerTaskCard";
import { PlannerTask } from "../../planner.types";

type Props = {
  tasks: PlannerTask[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onToggleComplete: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onEditTask: (task: PlannerTask) => void;
  onDelete: (id: string) => void;
};

export default function PlannerCompletedSection({
  tasks,
  isExpanded,
  onToggleExpanded,
  onToggleComplete,
  onToggleImportant,
  onEditTask,
  onDelete,
}: Props) {
  if (tasks.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.header} onPress={onToggleExpanded}>
        <Ionicons
          name={isExpanded ? "chevron-down" : "chevron-forward"}
          size={20}
          color="white"
        />
        <Text style={styles.headerText}>Zakończone</Text>
      </Pressable>

      {isExpanded && (
        <View style={styles.list}>
          {tasks.map((task) => (
            <PlannerTaskCard
              key={task.id}
              task={task}
              isCompletedCard
              onPress={() => onEditTask(task)}
              onToggleComplete={() => onToggleComplete(task.id)}
              onToggleImportant={() => onToggleImportant(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  header: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(70,90,110,0.72)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  list: {
    marginTop: 12,
  },
});