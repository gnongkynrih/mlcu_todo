import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { todoSchema } from "../schemas/todoSchema";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddTaskIcon from "@mui/icons-material/AddTask";

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");

  const searchTodos = useCallback((task) => {
    api
      .get("/todos/search", { params: { task } })
      .then((res) => setTodos(res.data))
      .catch((err) => console.error("Search failed", err));
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    searchTodos(value);
  };

  const handleOpenDeleteModal = (id) => {
    setSelectedId(id);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedId(null);
    setOpenDeleteModal(false);
  };

  const fetchTodos = useCallback(() => {
    api
      .get("/todos/get-todos")
      .then((res) => setTodos(res.data))
      .catch((err) => console.error("Fetch failed", err));
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(todoSchema),
    defaultValues: { title: "", description: "", is_completed: false },
  });

  const onSubmit = async (data) => {
    try {
      if (!isEditing) {
        await api.post("/todos/save", data);
      } else {
        await api.put(`/todos/${selectedId}`, data);
      }
      reset({ title: "", description: "", is_completed: false });
      fetchTodos();
      setIsEditing(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Save todo failed:", error);
    }
  };

  const deleteTodo = async () => {
    try {
      await api.delete(`/todos/${selectedId}`);
      setOpenDeleteModal(false);
      fetchTodos();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const editTodo = async (id) => {
    try {
      const { data: todo } = await api.get(`/todos/${id}`);
      reset({
        title: todo.title,
        description: todo.description || "",
        is_completed: todo.is_completed,
      });
      setIsEditing(true);
      setSelectedId(id);
    } catch (error) {
      console.error("Load todo failed:", error);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 750, letterSpacing: "-0.03em" }}>
            Tasks
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Capture work, track completion, and search across titles in real time.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "380px 1fr" },
            gap: { xs: 2, md: 3 },
            alignItems: "start",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              background:
                "linear-gradient(180deg, rgba(124,58,237,0.06), rgba(255,255,255,0) 120px), #fff",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <AddTaskIcon color="secondary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isEditing ? "Update task" : "New task"}
              </Typography>
            </Stack>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      fullWidth
                      label="Title"
                      placeholder="What needs to be done?"
                      {...field}
                      error={!!fieldState.error}
                      helperText={errors.title?.message}
                    />
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Details"
                      placeholder="Context, links, or notes"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="is_completed"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Mark as done"
                    />
                  )}
                />

                <Stack direction="row" spacing={1}>
                  {isEditing ? (
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedId(null);
                        reset({ title: "", description: "", is_completed: false });
                      }}
                    >
                      Cancel edit
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth={!isEditing}
                    sx={{
                      flex: 1,
                      py: 1.1,
                      background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                      boxShadow: "0 12px 30px rgba(124,58,237,0.28)",
                    }}
                  >
                    {isEditing ? "Save changes" : "Add to list"}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>

          <Stack spacing={2}>
            <TextField
              value={search}
              onChange={handleSearchChange}
              placeholder="Search titles"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: 440,
                bgcolor: "background.paper",
              }}
            />

            <Stack spacing={1.25}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={700}>
                  In progress
                </Typography>
                <Chip label={`${todos.length} total`} size="small" />
              </Stack>

              <Stack spacing={1}>
                {todos.map((todo) => (
                  <Paper
                    key={todo.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: todo.is_completed ? "success.light" : "divider",
                      bgcolor: todo.is_completed ? "rgba(22,163,74,0.05)" : "background.paper",
                      transition: "border-color 160ms ease, box-shadow 160ms ease",
                      "&:hover": {
                        borderColor: "secondary.light",
                        boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Box sx={{ flex: 1, textAlign: "left" }}>
                        <Typography fontWeight={700}>{todo.title}</Typography>
                        {todo.description ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {todo.description}
                          </Typography>
                        ) : null}
                      </Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: "flex-end" }}
                      >
                        <Chip
                          label={todo.is_completed ? "Done" : "Open"}
                          color={todo.is_completed ? "success" : "default"}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                        <IconButton
                          size="small"
                          aria-label="Edit todo"
                          onClick={() => editTodo(todo.id)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Delete todo"
                          onClick={() => handleOpenDeleteModal(todo.id)}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              {todos.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No tasks yet — add one on the left or adjust your search.
                  </Typography>
                </Paper>
              ) : null}
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(420px, calc(100vw - 32px))",
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Delete task?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            This cannot be undone. The task will be removed from your list.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button onClick={handleCloseDeleteModal}>Cancel</Button>
            <Button variant="contained" color="error" onClick={deleteTodo}>
              Delete
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </>
  );
}
