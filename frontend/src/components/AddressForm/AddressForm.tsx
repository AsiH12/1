import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { useForm, Controller } from "react-hook-form";
import "./AddressForm.css";

interface AddressFormProps {
  onSaveAddress: (data: AddressFormData) => void;
}

interface AddressFormData {
  id: number;
  address: string;
  city: string;
  country: string;
  user_id: number;
}

export function AddressForm({ onSaveAddress }: AddressFormProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<AddressFormData>();
  const [open, setOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<AddressFormData[]>([]);
  const [currentAddress, setCurrentAddress] = useState<AddressFormData | null>(
    null
  );
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Please log in to get addresses.");
  }

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) {
        throw new Error("Please log in to get addresses.");
      }

      const response = await fetch("http://localhost:5000/addresses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT token
        },
      });

      const data = await response.json();
      setAddresses(data.addresses);
    };

    fetchAddresses().catch((error) =>
      console.error("Error fetching addresses:", error)
    );
  }, []);

  const handleSaveAddress = async (data: AddressFormData) => {
    try {
      const response = await fetch(
        `http://localhost:5000/addresses${
          isEditing ? `/${currentAddress?.id}` : ""
        }`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send JWT token
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      const updatedAddress = await response.json();

      if (isEditing) {
        setAddresses((prevAddresses) =>
          prevAddresses.map((address) =>
            address.id === currentAddress?.id ? updatedAddress : address
          )
        );
      } else {
        setAddresses((prevAddresses) => [...prevAddresses, updatedAddress]);
      }

      setOpen(false);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleEditClick = (address: AddressFormData) => {
    setCurrentAddress(address);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    const response = await fetch(`http://localhost:5000/addresses/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setAddresses((prevAddresses) =>
        prevAddresses.filter((address) => address.id !== id)
      );
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Address has been deleted successfully.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Error deleting address.",
      });
    }
  };

  const handleDialogDelete = () => {
    if (currentAddress) {
      handleDeleteClick(currentAddress.id);
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentAddress(null);
    setIsEditing(false);
  };

  const columns: GridColDef[] = [
    { field: "address", headerName: "Address", width: 200 },
    { field: "city", headerName: "City", width: 150 },
    { field: "country", headerName: "Country", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditClick(params.row as AddressFormData)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.id as number)}
        />,
      ],
    },
  ];

  return (
    <div className="container">
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add/Remove Address
      </Button>
      <Box
        sx={{
          height: 400,
          width: "100%",
          marginTop: 2,
          backgroundColor: "white",
        }}
      >
        <DataGrid
          rows={addresses}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Edit Address" : "Add Address"}</DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit(handleSaveAddress)}>
          <DialogContent>
            <Box
              className="address-form"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Controller
                name="address"
                control={control}
                defaultValue={currentAddress?.address || ""}
                rules={{ required: "required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    sx={{ width: "400px", background: "white" }}
                    id="address"
                    label="Address"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    error={!!errors.address}
                    helperText={errors.address ? errors.address.message : null}
                  />
                )}
              />
              <Controller
                name="city"
                control={control}
                defaultValue={currentAddress?.city || ""}
                rules={{ required: "required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    sx={{ width: "400px", background: "white" }}
                    id="city"
                    label="City"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    error={!!errors.city}
                    helperText={errors.city ? errors.city.message : null}
                  />
                )}
              />
              <Controller
                name="country"
                control={control}
                defaultValue={currentAddress?.country || ""}
                rules={{ required: "required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    sx={{ width: "400px", background: "white" }}
                    id="country"
                    label="Country"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    error={!!errors.country}
                    helperText={errors.country ? errors.country.message : null}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            {isEditing && (
              <Button onClick={handleDialogDelete} color="secondary">
                Delete
              </Button>
            )}
            <Button type="submit" color="primary">
              Save Address
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
