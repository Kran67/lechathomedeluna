const { listUsers, getUser, createUser, updateUser, resetMyPassword } = require('../services/usersService');
const { mapUserRow } = require('../services/authService');
const { requireAuth } = require('../middlewares/auth');
const { statusFromError } = require('../utils/lib');

async function list(req, res) {
  try {
    const result = await listUsers();
    const users = [];
    result.rows.map((row) => users.push(mapUserRow(row)));
    res.json(users);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getById(req, res) {
  try {
    const result = await getUser(req.params.id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json(mapUserRow(result.rows[0]));
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function create(req, res) {
  try {
    const result = await createUser(req.body || {});
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function update(req, res) {
  try {
    const allowAdminRole = req.user && req.user.role === 'Admin';
    const updated = await updateUser(req.params.id, req.body || {}, { allowAdminRole });
    res.json(updated.rows[0]);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function resetPassword(req, res) {
  requireAuth(req, res, async () => {
    try {
      //const resend = new Resend(process.env.RESEND_API_KEY);
      //const result = await getUser(req.params.id);
      //if (result.rowCount > 0) {
      //  const user = mapUserRow(result.rows[0]);
      //  const payload = { id: user.id, name: user.name, email: user.email || null };
      //  const resetToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
//
      //  await resetMyPassword(user.id, resetToken);
//
      //  const { data, error } = await resend.emails.send({
      //    //from: "Admin <contact@lechathomedeluna.org>",
      //    from : "Acme <onboarding@resend.dev>",
      //    to: [user.email],
      //    subject: "Réinitilaisation du mot de passe",
      //    html: `Bonjour ${user.name} ${user.lastName},<br />
      //      Quelqu'un a demandé un nouveau mot de passe pour le site [Le Chat'Home de Luna] associé à ${user.email}
      //      <br /><br />
      //      Aucune modification n'a encore été apportée à votre compte.
      //      <br /><br />
      //      Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous (valide 24h) : 
      //      <a href="https://lechathomedeluna.vercel.app/resetpassword/${resetToken}">Réinitialiser votre mot de passe</a>
      //      <br /><br />
      //      Si vous n'avez pas demandé de nouveau mot de passe, veuillez nous en informer immédiatement en répondant à ce courriel.
      //      <br /><br />
      //      Cordialement,<br />L'équipe Le Chat'Home de Luna`,
      //  });
    //
      //  if (error) {
      //    return res.status(400).json({ error });
      //  }
    //
      //  return res.status(200).json({ data });
      //} else {
      //  return res.status(404).json({ error: 'User not found' });
      //}
    } catch (e) {
      return res.status(statusFromError(e)).json({ error: e.message });
    }
  })
}

module.exports = {
  list,
  getById,
  create,
  update,
  resetPassword
};
