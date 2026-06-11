// ── sendResponse.js ───────────────────────────────────────────
const sendSuccess = (res, status, message, data = null) => {
  res.status(status).json({ success: true, message, data });
};

const sendError = (res, status, message, errors = null) => {
  res.status(status).json({ success: false, message, ...(errors && { errors }) });
};

module.exports = { sendSuccess, sendError };
