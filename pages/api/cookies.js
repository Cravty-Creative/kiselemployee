import cookie from "cookie";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { cookie_name, value } = req.body;
    res.setHeader(
      "Set-Cookie",
      cookie.serialize(cookie_name, value, {
        httpOnly: true,
        maxAge: 60 * 60,
        sameSite: "strict",
        path: "/",
      })
    );

    res.status(200).json({ message: `set ${cookie_name} cookies success` });
  } else {
    res.status(400).json({ message: "Cannot Access" });
  }
}
