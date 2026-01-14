import { useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { Download, MessageSquare } from "lucide-react";

interface ActionButtonsProps {
  onDownload: () => void;
  variant?: "icon" | "text";
  color?: "primary" | "neutral";
  downloadTooltip?: string;
  commentTooltip?: string;
}

const ActionButtons = ({ 
  onDownload, 
  variant = "icon",
  color = "primary",
  downloadTooltip = "Download data",
  commentTooltip = "Add comment"
}: ActionButtonsProps) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [savedComment, setSavedComment] = useState("");

  const isPrimary = color === "primary";
  
  const primaryButtonStyle = {
    borderColor: 'hsl(174, 62%, 47%)',
    color: 'hsl(174, 62%, 47%)',
    '&:hover': {
      borderColor: 'hsl(174, 62%, 40%)',
      backgroundColor: 'hsl(174, 62%, 47%, 0.08)',
    },
  };

  const neutralButtonStyle = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '4px',
    color: 'text.secondary',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  };

  const buttonStyle = isPrimary ? primaryButtonStyle : neutralButtonStyle;

  const handleSaveComment = () => {
    setSavedComment(comment);
    setIsCommentOpen(false);
  };

  const handleOpenComment = () => {
    setComment(savedComment);
    setIsCommentOpen(true);
  };

  if (variant === "text") {
    return (
      <>
        <div className="flex items-center gap-2">
          <Tooltip title={downloadTooltip} arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download className="w-4 h-4" />}
              onClick={onDownload}
              sx={buttonStyle}
            >
              Download
            </Button>
          </Tooltip>
          <Tooltip title={savedComment ? "View/Edit comment" : commentTooltip} arrow>
            <Badge 
              color="error" 
              variant="dot" 
              invisible={!savedComment}
              sx={{ '& .MuiBadge-badge': { top: 8, right: 8 } }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<MessageSquare className="w-4 h-4" />}
                onClick={handleOpenComment}
                sx={buttonStyle}
              >
                Comments
              </Button>
            </Badge>
          </Tooltip>
        </div>

        {/* Comment Dialog */}
        <Dialog 
          open={isCommentOpen} 
          onClose={() => setIsCommentOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Add Comment</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              multiline
              rows={4}
              fullWidth
              placeholder="Enter your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setIsCommentOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveComment}
              sx={{
                backgroundColor: 'hsl(174, 62%, 47%)',
                '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Tooltip title={downloadTooltip} arrow>
          <IconButton
            size="small"
            onClick={onDownload}
            sx={isPrimary ? {
              border: '1px solid hsl(174, 62%, 47%)',
              color: 'hsl(174, 62%, 47%)',
              '&:hover': {
                backgroundColor: 'hsl(174, 62%, 47%, 0.08)',
              },
            } : {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Download className="w-4 h-4" />
          </IconButton>
        </Tooltip>
        <Tooltip title={savedComment ? "View/Edit comment" : commentTooltip} arrow>
          <Badge 
            color="error" 
            variant="dot" 
            invisible={!savedComment}
            sx={{ '& .MuiBadge-badge': { top: 4, right: 4 } }}
          >
            <IconButton
              size="small"
              onClick={handleOpenComment}
              sx={isPrimary ? {
                border: '1px solid hsl(174, 62%, 47%)',
                color: 'hsl(174, 62%, 47%)',
                '&:hover': {
                  backgroundColor: 'hsl(174, 62%, 47%, 0.08)',
                },
              } : {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '4px',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <MessageSquare className="w-4 h-4" />
            </IconButton>
          </Badge>
        </Tooltip>
      </div>

      {/* Comment Dialog */}
      <Dialog 
        open={isCommentOpen} 
        onClose={() => setIsCommentOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            placeholder="Enter your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsCommentOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveComment}
            sx={{
              backgroundColor: 'hsl(174, 62%, 47%)',
              '&:hover': { backgroundColor: 'hsl(174, 62%, 40%)' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionButtons;
