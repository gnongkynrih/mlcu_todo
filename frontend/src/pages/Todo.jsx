import {
  ButtonGroup,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Paper,
  Modal,
} from "@mui/material";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { todoSchema } from "../schemas/todoSchema";
import { useEffect, useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function Todo() {
  const [todos, setTodos] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");

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

  const searchTodos = (task) => {
    try {
      axios
        .get(`http://localhost:8000/todos/search?task=${task}`)
        .then((res) => {
          setTodos(res.data);
        });
    } catch (err) {
      console.error("Search failed", err);
    }
  };
  // Fetching data - only on mount
  const fetchTodos = () => {
    try {
      axios.get("http://localhost:8000/todos/get-todos").then((res) => {
        setTodos(res.data);
      });
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []); // Empty dependency array to prevent infinite loops

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
      if (isEditing == false) {
        await axios.post("http://localhost:8000/todos/save", data);
      } else {
        await axios.put(`http://localhost:8000/todos/${selectedId}`, data);
      }
      reset({
        title: "",
        description: "",
        is_completed: false,
      }); // Clear form
      fetchTodos(); // Refresh list
      setIsEditing(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const deleteTodo = async () => {
    try {
      await axios.delete(`http://localhost:8000/todos/${selectedId}`);
      // await axios.delete('http://localhost:8000/delete-todo/' + selectedId);
      setOpenDeleteModal(false);
      fetchTodos(); // Refresh list
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const editTodo = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/todos/${id}`);
      const todo = response.data;
      // Populate form with fetched data
      reset({
        title: todo.title,
        description: todo.description || "",
        is_completed: todo.is_completed,
      });
      setIsEditing(true);
      setSelectedId(id); // Track which todo is being edited
    } catch (error) {
      console.error("Failed to fetch todo:", error);
    }
  };
  return (
    <>
      <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "#fff" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Input Form */}
          <div className="lg:col-span-4">
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 0, border: "1px solid #e5e5e5" }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 400, color: "#333" }}
              >
                New Task
              </Typography>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        label="What needs to be done?"
                        {...field}
                        variant="outlined"
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
                        rows={3}
                        label="Additional details"
                        {...field}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                  {/* is Completed using switch */}
                  <Controller
                    name="is_completed"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Completed"
                      />
                    )}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    type="submit"
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 0,
                      textTransform: "none",
                      color: "#333",
                      borderColor: "#333",
                      "&:hover": { bgcolor: "#333", color: "#fff" },
                    }}
                  >
                    {isEditing ? "Update" : "Save"}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </div>

          {/* RIGHT COLUMN: Task List */}
          <div className="lg:col-span-8">
            <Box sx={{ mb: 3, pb: 1, borderBottom: "2px solid #333" }}>
              <TextField
                value={search}
                onChange={handleSearchChange}
                name="search"
                label="Search"
                variant="outlined"
                size="small"
                sx={{ width: "100%" }}
              />

              <Typography variant="h6" sx={{ fontWeight: 400, color: "#333" }}>
                Tasks ({todos.length})
              </Typography>
            </Box>

            <Stack spacing={1}>
              {todos.map((todo) => (
                <Box
                  key={todo.id}
                  sx={{
                    py: 1.5,
                    borderBottom: "1px solid #e5e5e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body1" sx={{ color: "#333" }}>
                    {todo.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: todo.is_completed ? "#666" : "#999",
                      fontStyle: todo.is_completed ? "normal" : "italic",
                    }}
                  >
                    {todo.is_completed ? "Done" : "Pending"}
                  </Typography>
                  <ButtonGroup variant="text" aria-label="Basic button group">
                    <Button onClick={() => editTodo(todo.id)}>Edit</Button>
                    <Button onClick={() => handleOpenDeleteModal(todo.id)}>
                      Delete
                    </Button>
                  </ButtonGroup>
                </Box>
              ))}
            </Stack>
          </div>
        </div>
      </Box>

      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Delete Task
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete this task?
          </Typography>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseDeleteModal}>Cancel</Button>
            <Button onClick={deleteTodo} variant="contained">
              Yes, Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default Todo;
