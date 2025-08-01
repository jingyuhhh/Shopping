import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { resetCart } from "../../store/cart.js";
import { getTasks } from "../../data/tasks.js";
import { useDispatch } from "react-redux";
import { PII } from "../../data/PII.js";
import { usePreserveQueryNavigate } from "../../hooks/useQueryNavigate.js";
import TaskCompletionModal from "../TaskCompletionModal/TaskCompletionModal.jsx";

const QuestionMark = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [skipReason, setSkipReason] = useState("");
  const [completionModalOpen, setCompletionModalOpen] = useState(false); // 控制 TaskCompletionModal

  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userID = searchParams.get("userID") || 1;
  const tasks = getTasks(userID);
  const dispatch = useDispatch();

  const getCurrentTask = () => {
    if (id) {
      return tasks.find((task) => task.id === parseInt(id));
    }
    return tasks[0];
  };

  const getNextTask = () => {
    const currentTask = getCurrentTask();
    if (!currentTask) return null;
    const currentIndex = tasks.findIndex((task) => task.id === currentTask.id);
    if (currentIndex === 13) return null;
    const nextIndex = (currentIndex + 1) % 14;
    return tasks[nextIndex] || null;
  };

  const currentTask = getCurrentTask();
  const nextTask = getNextTask();

  const handleClick = () => setDialogOpen(true);
  const handleClose = () => {
    setDialogOpen(false);
    setSelectedOption("");
    setSkipReason("");
  };

  const handleOptionSelect = (option) => setSelectedOption(option);

  const handleSubmit = () => {
    dispatch(resetCart());
    // 打开 TaskCompletionModal 而不是直接 navigate
    setCompletionModalOpen(true);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Help" placement="bottom">
        <IconButton
          onClick={handleClick}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>

      {/* 原有的弹窗 */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            Task Options
          </Typography>
        </DialogTitle>

        <DialogContent>
          {currentTask && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Current Task: {currentTask.title}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              Personal Information:
            </Typography>
            <Typography>Email: {PII.email}</Typography>
            <Typography>Phone: {PII.phone}</Typography>
            <Typography>Address: {PII.address}</Typography>
            <Typography>Name: {PII.name}</Typography>
            <Typography>Payment Password: {PII.password}</Typography>
          </Box>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedOption}
              onChange={(e) => handleOptionSelect(e.target.value)}
            >
              <FormControlLabel
                value="finished"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon color="success" />
                    <Typography>I finished the task</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="skip"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SkipNextIcon color="warning" />
                    <Typography>I want to skip the task</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {selectedOption === "skip" && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Please provide a reason for skipping"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="Enter your reason here..."
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !selectedOption ||
              (selectedOption === "skip" && !skipReason.trim())
            }
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        id={id}
        open={completionModalOpen}
        targetTaskType={currentTask?.taskType}
        onClose={() => setCompletionModalOpen(false)}
      />
    </>
  );
};

export default QuestionMark;
