import { render, screen } from "@testing-library/react";
import { Members } from "./Members";

test("lists members after loading", async () => {
  render(<Members />);
  expect(await screen.findByText("Ana Ruiz", {}, { timeout: 2000 })).toBeInTheDocument();
  expect(screen.getByText("Invited")).toBeInTheDocument();
});
