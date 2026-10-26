import { beforeEach, describe, expect, it, vi } from "vitest";

const apiPost = vi.hoisted(() => vi.fn());

vi.mock("../lib/api", () => ({
  api: { post: apiPost },
}));

import sendLead from "./lead";

beforeEach(() => vi.clearAllMocks());

describe("sendLead", () => {
  it("sends lead data to the backend and excludes generated print files", async () => {
    apiPost.mockResolvedValue({ status: 201 });
    const request = {
      intent: "maquette",
      intentLabel: "Maquette — carte Pro",
      products: ["Carte Pro"],
      name: "Awa Ndiaye",
      phone: "+221771234567",
      consent_marketing: false,
      source: "configurateur",
      design: { recto: "logo", taille_logo: 18, logo_fichier: "data:image/png;base64,secret" },
      print: { recto: "data:image/png;base64,large-image" },
    };

    await expect(sendLead(request)).resolves.toEqual({ mode: "api" });
    expect(apiPost).toHaveBeenCalledOnce();
    const [path, body] = apiPost.mock.calls[0] as [string, string];
    expect(path).toBe("/leads");
    expect(JSON.parse(body)).toMatchObject({
      intent: "maquette",
      name: "Awa Ndiaye",
      design: { recto: "logo", taille_logo: 18 },
    });
    expect(body).not.toContain("base64");
    expect(JSON.parse(body)).not.toHaveProperty("print");
  });
});
