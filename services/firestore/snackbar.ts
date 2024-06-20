export const openSnack = (
  caso: "success" | "error" | "warning" = "success",
  message: string = ""
) => {
  return {
    open: true,
    severity: caso,
    message: message,
  };
};
