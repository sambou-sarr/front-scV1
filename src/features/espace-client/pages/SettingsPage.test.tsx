// @vitest-environment jsdom
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forgotPassword } from "../../auth/auth.service";
import SettingsPage from "./SettingsPage";

vi.mock("../../auth/auth.service", () => ({
  forgotPassword: vi.fn(),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe("Paramètres client : réinitialisation du mot de passe", () => {
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    vi.mocked(forgotPassword).mockReset();
    host = document.createElement("div");
    root = createRoot(host);
    const user = { name: "Awa Ndiaye", email: "awa@example.sn" };
    act(() => {
      root.render(
        h(
          MemoryRouter,
          null,
          h(
            Routes,
            null,
            h(
              Route,
              { element: h(Outlet, { context: { user } }) },
              h(Route, { path: "/", element: h(SettingsPage) }),
            ),
          ),
        ),
      );
    });
  });

  afterEach(() => act(() => root.unmount()));

  it("envoie le lien à l’adresse du compte et affiche une confirmation", async () => {
    vi.mocked(forgotPassword).mockResolvedValue();

    await act(async () => {
      host.querySelector<HTMLButtonElement>(".st-reset-action")!.click();
      await Promise.resolve();
    });

    expect(forgotPassword).toHaveBeenCalledOnce();
    expect(forgotPassword).toHaveBeenCalledWith("awa@example.sn");
    expect(host.textContent).toContain("La demande a été prise en compte");
    expect(host.querySelector('[role="status"]')).toBeTruthy();
  });

  it("affiche une erreur explicite si l’envoi échoue", async () => {
    vi.mocked(forgotPassword).mockRejectedValue(
      new Error("Vérifiez votre connexion et réessayez."),
    );

    await act(async () => {
      host.querySelector<HTMLButtonElement>(".st-reset-action")!.click();
      await Promise.resolve();
    });

    expect(host.textContent).toContain(
      "Impossible d’envoyer le lien : Vérifiez votre connexion et réessayez.",
    );
    expect(host.querySelector('[role="alert"]')).toBeTruthy();
  });
});
