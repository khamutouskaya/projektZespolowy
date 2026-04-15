import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import PlannerHeader from "../components/plannerScreen/PlannerHeader";
import PlannerTaskCard from "../components/plannerScreen/PlannerTaskCard";
import PlannerAddBar from "../components/plannerScreen/PlannerAddBar";
import PlannerInputBar from "../components/plannerScreen/PlannerInputBar";
import PlannerEmptyState from "../components/plannerScreen/PlannerEmptyState";
import PlannerNoteModal from "../components/plannerScreen/PlannerNoteModal";
import PlannerCompletedSection from "../components/plannerScreen/PlannerCompletedSection";
import PlannerDateModal from "../components/plannerScreen/PlannerDateModal";
import PlannerCalendarModal from "../components/plannerScreen/PlannerCalendarModal";
import PlannerReminderModal from "../components/plannerScreen/PlannerReminderModal";
import PlannerReminderDateTimeModal from "../components/plannerScreen/PlannerReminderDateTimeModal";
import PlannerCategoryModal from "../components/plannerScreen/PlannerCategoryModal";
import { PlannerTask } from "../planner.types";

type ReminderPreset = "today" | "tomorrow" | "nextWeek" | null;

export default function PlannerScreen() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskNote, setTaskNote] = useState("");
  const [selectedTaskDate, setSelectedTaskDate] = useState<string | null>(null);
  const [selectedReminderDate, setSelectedReminderDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showReminderDateTimeModal, setShowReminderDateTimeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [reminderPreset, setReminderPreset] = useState<ReminderPreset>(null);
  const [reminderBaseDate, setReminderBaseDate] = useState<Date | null>(null);

  const bottomDockTranslate = useRef(new Animated.Value(0)).current;

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = event.endCoordinates.height;
      const lift =
        Platform.OS === "ios" ? keyboardHeight - 86 : keyboardHeight - 24;

      Animated.timing(bottomDockTranslate, {
        toValue: -Math.max(lift, 0),
        duration: event.duration ?? 260,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      Animated.timing(bottomDockTranslate, {
        toValue: 0,
        duration: event.duration ?? 240,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [bottomDockTranslate]);

  const runSoftLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 420,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  };

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );

  const dateText = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, []);

  const formatChipDate = (dateString: string) => {
    const selected = new Date(dateString);
    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const normalize = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    const selectedTime = normalize(selected);

    if (selectedTime === normalize(today)) return "Termin: dzisiaj";
    if (selectedTime === normalize(tomorrow)) return "Termin: jutro";
    if (selectedTime === normalize(nextWeek)) return "Termin: za tydzień";

    return `Termin: ${selected.toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })}`;
  };

  const formatReminderChip = (dateString: string) => {
    const date = new Date(dateString);
    return `Przypomnienie: ${date.toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })} ${date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const resetDraftFields = () => {
    setNewTaskTitle("");
    setTaskNote("");
    setSelectedTaskDate(null);
    setSelectedReminderDate(null);
    setSelectedCategory(null);
    setReminderPreset(null);
    setReminderBaseDate(null);
  };

  const handleOpenAdd = () => {
    runSoftLayoutAnimation();
    setIsAdding(true);
    setEditingTaskId(null);
    resetDraftFields();
  };

  const handleEditTask = (task: PlannerTask) => {
    runSoftLayoutAnimation();
    setIsAdding(true);
    setEditingTaskId(task.id);
    setNewTaskTitle(task.title);
    setTaskNote(task.note);
    setSelectedTaskDate(task.date);
    setSelectedReminderDate(task.reminderDate);
    setSelectedCategory(task.category);
    setReminderPreset(null);
    setReminderBaseDate(null);
  };

  const saveTask = ({
    keepAddingOpen = false,
  }: {
    keepAddingOpen?: boolean;
  } = {}) => {
    const trimmed = newTaskTitle.trim();

    if (!trimmed) {
      if (!keepAddingOpen) {
        runSoftLayoutAnimation();
        setIsAdding(false);
        setEditingTaskId(null);
        resetDraftFields();
      }
      return;
    }

    runSoftLayoutAnimation();

    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: trimmed,
                note: taskNote,
                date: selectedTaskDate,
                reminderDate: selectedReminderDate,
                category: selectedCategory,
              }
            : task
        )
      );
      setEditingTaskId(null);
    } else {
      const newTask: PlannerTask = {
        id: Date.now().toString(),
        title: trimmed,
        important: false,
        completed: false,
        note: taskNote,
        date: selectedTaskDate,
        reminderDate: selectedReminderDate,
        category: selectedCategory,
      };

      setTasks((prev) => [newTask, ...prev]);
    }

    resetDraftFields();

    if (!keepAddingOpen) {
      setIsAdding(false);
    }
  };

  const handleDoneAdd = () => {
    saveTask({ keepAddingOpen: false });
  };

  const handleSubmitFromKeyboard = () => {
    saveTask({ keepAddingOpen: true });
  };

  const handleToggleImportant = (id: string) => {
    runSoftLayoutAnimation();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, important: !task.important } : task
      )
    );
  };

  const handleToggleComplete = (id: string) => {
    setTimeout(() => {
      runSoftLayoutAnimation();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    }, 40);
  };

  const handleDeleteTask = (id: string) => {
    setTimeout(() => {
      runSoftLayoutAnimation();
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }, 60);

    if (editingTaskId === id) {
      setEditingTaskId(null);
      resetDraftFields();
      setIsAdding(false);
    }
  };

  const handleOpenNote = () => {
    setShowNoteModal(true);
  };

  const handleCloseNote = () => {
    setShowNoteModal(false);
  };

  const handleToggleCompletedSection = () => {
    runSoftLayoutAnimation();
    setShowCompleted((prev) => !prev);
  };

  const handleSelectToday = () => {
    const today = new Date();
    setSelectedTaskDate(today.toISOString());
    setShowDateModal(false);
  };

  const handleSelectTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedTaskDate(tomorrow.toISOString());
    setShowDateModal(false);
  };

  const handleSelectNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedTaskDate(nextWeek.toISOString());
    setShowDateModal(false);
  };

  const handleOpenCalendar = () => {
    setShowDateModal(false);
    setShowCalendarModal(true);
  };

  const handleConfirmCalendar = () => {
    setShowCalendarModal(false);
  };

  const handleLaterTodayReminder = () => {
    const date = new Date();
    date.setSeconds(0, 0);
    setReminderPreset("today");
    setReminderBaseDate(date);
    setShowReminderModal(false);
    setShowReminderDateTimeModal(true);
  };

  const handleTomorrowReminder = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    setReminderPreset("tomorrow");
    setReminderBaseDate(date);
    setShowReminderModal(false);
    setShowReminderDateTimeModal(true);
  };

  const handleNextWeekReminder = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    date.setHours(9, 0, 0, 0);
    setReminderPreset("nextWeek");
    setReminderBaseDate(date);
    setShowReminderModal(false);
    setShowReminderDateTimeModal(true);
  };

  const handlePickReminderDateTime = () => {
    setReminderPreset(null);
    setReminderBaseDate(null);
    setShowReminderModal(false);
    setShowReminderDateTimeModal(true);
  };

  const handleConfirmReminderDateTime = (isoString: string) => {
    setSelectedReminderDate(isoString);
    setShowReminderDateTimeModal(false);
    setReminderPreset(null);
    setReminderBaseDate(null);
  };

  const handleClearReminder = () => {
    setSelectedReminderDate(null);
    setReminderPreset(null);
    setReminderBaseDate(null);
    setShowReminderModal(false);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setShowCategoryModal(false);
  };

  return (
    <LayoutContainer>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.plannerHeader}>
            <PlannerHeader
              title="Mój dzień"
              dateText={dateText}
              showDone={isAdding}
              onDone={handleDoneAdd}
            />
          </View>

          {activeTasks.length === 0 && completedTasks.length > 0 ? (
            <PlannerCompletedSection
              tasks={completedTasks}
              isExpanded={showCompleted}
              onToggleExpanded={handleToggleCompletedSection}
              onToggleComplete={handleToggleComplete}
              onToggleImportant={handleToggleImportant}
              onEditTask={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ) : (
            <>
              {activeTasks.length === 0 ? (
                <PlannerEmptyState />
              ) : (
                activeTasks.map((task) => (
                  <PlannerTaskCard
                    key={task.id}
                    task={task}
                    onPress={() => handleEditTask(task)}
                    onToggleComplete={() => handleToggleComplete(task.id)}
                    onToggleImportant={() => handleToggleImportant(task.id)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))
              )}

              <PlannerCompletedSection
                tasks={completedTasks}
                isExpanded={showCompleted}
                onToggleExpanded={handleToggleCompletedSection}
                onToggleComplete={handleToggleComplete}
                onToggleImportant={handleToggleImportant}
                onEditTask={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </>
          )}
        </ScrollView>

        <Animated.View
          style={[
            styles.bottomDock,
            { transform: [{ translateY: bottomDockTranslate }] },
          ]}
        >
          {isAdding ? (
            <PlannerInputBar
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onOpenCategory={() => setShowCategoryModal(true)}
              onOpenNote={handleOpenNote}
              onOpenDate={() => setShowDateModal(true)}
              onOpenReminder={() => setShowReminderModal(true)}
              categoryLabel={selectedCategory}
              dateLabel={
                selectedTaskDate ? formatChipDate(selectedTaskDate) : null
              }
              reminderLabel={
                selectedReminderDate
                  ? formatReminderChip(selectedReminderDate)
                  : null
              }
              noteLabel={taskNote.trim() ? "Notatka" : null}
              onClearCategory={handleClearCategory}
              onClearDate={() => setSelectedTaskDate(null)}
              onClearReminder={() => setSelectedReminderDate(null)}
              onClearNote={() => setTaskNote("")}
              onSubmit={handleSubmitFromKeyboard}
            />
          ) : (
            <PlannerAddBar onPress={handleOpenAdd} />
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      <PlannerNoteModal
        visible={showNoteModal}
        value={taskNote}
        onChangeText={setTaskNote}
        onClose={handleCloseNote}
      />

      <PlannerDateModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onToday={handleSelectToday}
        onTomorrow={handleSelectTomorrow}
        onNextWeek={handleSelectNextWeek}
        onPickDate={handleOpenCalendar}
      />

      <PlannerCalendarModal
        visible={showCalendarModal}
        selectedDate={
          selectedTaskDate
            ? new Date(selectedTaskDate).toISOString().split("T")[0]
            : null
        }
        onClose={() => setShowCalendarModal(false)}
        onConfirm={handleConfirmCalendar}
        onSelectDate={(date) => {
          const picked = new Date(date);
          setSelectedTaskDate(picked.toISOString());
        }}
      />

      <PlannerReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onLaterToday={handleLaterTodayReminder}
        onTomorrow={handleTomorrowReminder}
        onNextWeek={handleNextWeekReminder}
        onPickDateTime={handlePickReminderDateTime}
        onClearReminder={handleClearReminder}
        hasReminder={!!selectedReminderDate}
      />

      <PlannerReminderDateTimeModal
        visible={showReminderDateTimeModal}
        initialValue={selectedReminderDate}
        initialDateOnly={reminderBaseDate}
        pickDateFirst={reminderPreset === null}
        onClose={() => {
          setShowReminderDateTimeModal(false);
          setReminderPreset(null);
          setReminderBaseDate(null);
        }}
        onConfirm={handleConfirmReminderDateTime}
      />

      <PlannerCategoryModal
        visible={showCategoryModal}
        selectedCategory={selectedCategory}
        onClose={() => setShowCategoryModal(false)}
        onSelectCategory={handleSelectCategory}
        onClearCategory={handleClearCategory}
      />
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 240,
  },
  bottomDock: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 98,
  },
  plannerHeader: {
    marginTop: -4,
  },
});