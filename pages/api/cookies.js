import cookie from "cookie";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { cookie_name, value, max_age } = req.body;
    res.setHeader(
      "Set-Cookie",
      cookie.serialize(cookie_name, value, {
        httpOnly: true,
        maxAge: max_age !== undefined && max_age !== null ? max_age : 60 * 60,
        sameSite: "strict",
        path: "/",
      })
    );

    res.status(200).json({ message: `set ${cookie_name} cookies success` });
  } else if (req.method === "GET") res.status(200).json({ message: "get access_token success", data: req.cookies });
}
