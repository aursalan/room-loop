export const getRoomStatus = (startTimeStr, endTimeStr) => {
    const now = new Date();
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
  
    if (now < startTime) {
      return 'scheduled';
    } else if (now >= startTime && now < endTime) {
      return 'live';
    } else if (now >= endTime) {
      return 'closed';
    }
    return 'unknown'; // Fallback
  };
  
  // Optional: Function to format dates for display if needed later
  export const formatDisplayTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString(); // Uses user's local format
  };