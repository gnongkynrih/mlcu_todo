import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { api } from "../api/client";
import { userCreateSchema, userFormSchema } from "../schemas/userSchema";

function UserUpsertDialog({ open, editingId, onClose, onSaved }) {
  const isEditing = editingId != null;
  const schema = isEditing ? userFormSchema : userCreateSchema;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editingId == null) {
      reset({ name: "", email: "", password: "", role: "user" });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await api.get(`/users/view/${editingId}`);
      if (cancelled) return;
      reset({
        name: data.name || "",
        email: data.email,
        password: "",
        role: data.role || "user",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [open, editingId, reset]);

  const onSave = async (values) => {
    if (isEditing) {
      await api.put(`/users/edit/${editingId}`, {
        name: values.name || null,
        email: values.email,
        role: values.role,
        password: values.password || undefined,
      });
    } else {
      await api.post("/users/save", {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
    }
    onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? "Edit user" : "Invite user"}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Display name"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={isEditing ? "New password (optional)" : "Password"}
                  type="password"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    (isEditing ? "Leave blank to keep the current password." : "")
                  }
                />
              )}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select labelId="role-label" label="Role" {...field}>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            {errors.root ? (
              <Typography color="error" variant="body2">
                {errors.root.message}
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? "Save changes" : "Create user"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = () => {
    api.get("/users/get-users").then((res) => setUsers(res.data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get("/users/search", { params: { task: search } })
        .then((res) => setUsers(res.data))
        .catch(() => fetchUsers());
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (id) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    await api.delete(`/users/delete/${deleteId}`);
    setDeleteId(null);
    fetchUsers();
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <div>
          <Typography variant="h4" sx={{ fontWeight: 750, letterSpacing: "-0.03em" }}>
            People & access
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Create accounts, assign roles, and keep emails unique across the workspace.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={openCreate}
          sx={{
            background: "linear-gradient(90deg, #7c3aed, #a855f7)",
            boxShadow: "0 12px 30px rgba(124,58,237,0.28)",
          }}
        >
          New user
        </Button>
      </Box>

      <TextField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 420 }}
      />

      <Stack spacing={1.5}>
        {users.map((u) => (
          <Paper
            key={u.id}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack spacing={0.5}>
              <Typography fontWeight={700}>{u.name || u.email}</Typography>
              <Typography variant="body2" color="text.secondary">
                {u.email}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={u.role}
                size="small"
                color={u.role === "admin" ? "secondary" : "default"}
                sx={{ fontWeight: 600, textTransform: "capitalize" }}
              />
              <IconButton
                aria-label="Edit user"
                onClick={() => openEdit(u.id)}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Delete user"
                color="error"
                onClick={() => setDeleteId(u.id)}
                size="small"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
        {users.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography color="text.secondary">No users match this search.</Typography>
          </Paper>
        ) : null}
      </Stack>

      <UserUpsertDialog
        key={editingId ?? "new"}
        open={dialogOpen}
        editingId={editingId}
        onClose={closeDialog}
        onSaved={() => {
          closeDialog();
          fetchUsers();
        }}
      />

      <Dialog open={deleteId != null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Remove user</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This permanently removes the account. Todos owned by this user may be blocked by
            database constraints until they are reassigned or removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
