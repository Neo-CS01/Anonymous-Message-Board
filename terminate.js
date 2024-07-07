function terminate(server, options = { coredump: false, timeout: 500 }) {
  // Exit function
  const exit = (code) => {
    // If coredump option is set, abort the process to create a core dump
    if (options.coredump) {
      process.abort();
    } else {
      // Otherwise, exit the process with the provided code
      process.exit(code);
    }
  };

  return (code, reason) => (err, promise) => {
    if (err && err instanceof Error) {
      // Log error information, replace with a proper logging library
      console.error("SERVER ERROR:", err.message, err.stack);
    }

    // Attempt a graceful shutdown of the server
    server.close(() => {
      exit(code);
    });

    // Forcefully exit the process after a timeout, unref to allow the program to exit naturally if possible
    setTimeout(() => {
      exit(code);
    }, options.timeout).unref();
  };
}

module.exports = terminate;
