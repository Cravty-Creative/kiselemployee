import cookie from "cookie";

export default function handler(req, res) {
  if (req.method === "POST") {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("access_token", null, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        path: "/",
      })
    );

    return res.end();
  } else {
    return res.status(404).json({ code: 404, message: "Forbidden" });
  }
}
