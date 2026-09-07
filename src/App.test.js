import { render, screen } from "@testing-library/react";
import App from "./App";

test("renderiza el título de la Pokédex", () => {
  render(<App />);
  expect(screen.getByText(/Pokédex/i)).toBeInTheDocument();
});