import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("calls onClick and defaults to type=button", () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Save</Button>);
  const button = screen.getByRole("button", { name: "Save" });
  expect(button).toHaveAttribute("type", "button");
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledOnce();
});
