const {
  listCats,
  getCatDetails,
  createCat,
  updateCat,
  deleteCat,
  updateCatFavoriteCount,
  getAllFACatsNotFullyCompletedCount,
  getAllFACatsNotFullyCompletedList,
  getAllAdoptedCatsNotFullyCompletedCount,
  getAllAdoptedCatsNotFullyCompletedList,
  catsHasPreVisitWithoutDateList,
  createAdoptionRequestForCat,
  getAdoptedCatsCount,
  catsBoosterVaccinationNoLaterThanOneMonthCount,
  catsBoosterVaccinationNoLaterThanOneMonthList
} = require('../services/catsService');
const {
  createSystemMessage
} = require('../services/messagingService');
const { statusFromError, formatDDMMY } = require('../utils/lib');

async function list(req, res) {
  try {
    const rows = await listCats();
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function listAdoptable(req, res) {
  try {
    const rows = await listCats(true);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function listAdopted(req, res) {
  try {
    const rows = await listCats(false, req.params.year);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function listMine(req, res) {
  try {
    const rows = await listCats(false, null, req.params.id);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getById(req, res) {
  try {
    const prop = await getCatDetails(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Chat introuvable' });
    res.json(prop);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function create(req, res) {
  try {
    const created = await createCat(req.body || {});
    res.status(201).json(created);
  } catch (e) {
    const code = statusFromError(e);
    // Map message for validation consistency
    let msg = e.message;
    if (code === 409) msg = 'Un chat avec le même identifiant existe déjà.';
    if (msg === 'Nom est requis') return res.status(400).json({ error: msg });
    if (msg === 'Description est requis') return res.status(400).json({ error: msg });
    if (msg === 'Sexe est requis') return res.status(400).json({ error: msg });
    if (msg.startsWith('hostfamily_id')) return res.status(400).json({ error: msg });
    res.status(code).json({ error: msg });
  }
}

async function update(req, res) {
  try {
    const baseUrl = req.body.baseUrl;
    const updated = await updateCat(req.params.slug, req.body || {});
    await createSystemMessage(
      5,
      1,
      `La fiche pour le 🐈 ${baseUrl}/admin/cat/${updated.slug}[${updated.name}] vient d'être mise à jour.
          Date d'entrée : ${updated.entryDate ? formatDDMMY(new Date(updated.entryDate)) : ""}
          Provenance : ${updated.provenance ?? ""}
          Robe : ${updated.dress ?? ""}
          Date de naissance : ${updated.birthDate ? formatDDMMY(new Date(updated.birthDate)) : ""}
          N° identification: ${updated.numId ?? ""}`, []);
    res.json(updated);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function updateFavoriteCount(req, res) {
  try {
    await updateCatFavoriteCount(req.params.slug);
    res.status(201).end();
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function remove(req, res) {
  try {
    await deleteCat(req.params.slug);
    res.status(204).end();
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function cloneAndRemove(req, res) {
  try {
    const props = await getCatDetails(req.params.slug);
    if (props) {
      props.adoptionDate = null;
      //props.entryDate = 
      props.hostFamily = null;
      props.isAdoptable = false;
      props.isDuringVisit = false;
      props.preVisitDate = null;
      props.slug = null;
      props.id = null;
      props.favoriteCount = 0;
      await create({ body: props}, res);
      await deleteCat(req.params.slug);
      res.status(204).end();
    } else {
      res.status(500).end();
    }
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function notFullyCompletedCount(req, res) {
  try {
    const count = await getAllFACatsNotFullyCompletedCount(req.params.id);
    res.json(count ? parseInt(count,10) : 0);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function notFullyCompletedList(req, res) {
  try {
    const list = await getAllFACatsNotFullyCompletedList(req.params.id);
    res.json(list);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function adoptedNotFullyCompletedCount(req, res) {
  try {
    const count = await getAllAdoptedCatsNotFullyCompletedCount();
    res.json(count ? parseInt(count,10) : 0);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function adoptedNotFullyCompletedList(req, res) {
  try {
    const list = await getAllAdoptedCatsNotFullyCompletedList();
    res.json(list);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function hasPreVisitWithoutDateList(req, res) {
  try {
    const list = await catsHasPreVisitWithoutDateList();
    res.json(list);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function createAdoptionRequest(req, res) {
  try {
    await createAdoptionRequestForCat(req.body || {});
    const baseUrl = req.body.baseUrl;
    const slug = req.body.catSlug;
    const name = req.body.catName;
    await createSystemMessage(1, 1, `La demande d'adoption pour le 🐈 ${baseUrl}/admin/cat/${slug}[${name}] vient d'être créée.\nEmail de l'adoptant : ${req.body.email}`);
    res.status(201).end();
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function adoptedCount(req, res) {
  try {
    const count = await getAdoptedCatsCount(req.params.id);
    res.json(count ? parseInt(count,10) : 0);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function boosterVaccinationNoLaterThanOneMonthCount(req, res) {
  try {
    const count = await catsBoosterVaccinationNoLaterThanOneMonthCount(req.params.id);
    res.json(count ? parseInt(count,10) : 0);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function boosterVaccinationNoLaterThanOneMonthList(req, res) {
  try {
    const list = await catsBoosterVaccinationNoLaterThanOneMonthList(req.params.id);
    res.json(list);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}


module.exports = {
  list,
  listAdoptable,
  listAdopted,
  listMine,
  getById,
  create,
  update,
  remove,
  updateFavoriteCount,
  notFullyCompletedCount,
  notFullyCompletedList,
  adoptedNotFullyCompletedCount,
  adoptedNotFullyCompletedList,
  hasPreVisitWithoutDateList,
  createAdoptionRequest,
  adoptedCount,
  cloneAndRemove,
  boosterVaccinationNoLaterThanOneMonthCount,
  boosterVaccinationNoLaterThanOneMonthList
};
