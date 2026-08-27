import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Campaign Studio", () => {
  it("renders the approved campaign brief fields", () => {
    render(<App />);
    expect(screen.getByText("Campaign Studio")).toBeInTheDocument();
    expect(screen.getByLabelText("Campaign brief")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate campaign/i })).toBeInTheDocument();
  });
});
