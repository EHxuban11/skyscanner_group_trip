const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Logging
app.use((req, res, next) => {
  if (['POST','PUT','PATCH','DELETE'].includes(req.method)) {
    console.log(`→ ${req.method} ${req.originalUrl}`, req.body)
  } else {
    console.log(`→ ${req.method} ${req.originalUrl}`)
  }
  next()
})

// Test
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node!' })
})

//
// ─── GROUPS ────────────────────────────────────────────────────────────────────
//
app.get('/api/groups', async (req, res, next) => {
  const { memberId } = req.query
  try {
    const where = memberId
      ? { members: { some: { id: memberId } } }
      : { id: { equals: null } }
    const groups = await prisma.group.findMany({
      where,
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(groups)
  } catch (err) {
    next(err)
  }
})

app.post('/api/groups', async (req, res, next) => {
  const { groupName, members } = req.body
  if (!groupName || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: 'groupName and members are required' })
  }
  try {
    const group = await prisma.group.create({
      data: {
        name: groupName,
        members: { create: members.map(name => ({ name })) },
      },
      include: { members: true },
    })
    res.json(group)
  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('name')) {
      return res.status(400).json({ error: 'A group with that name already exists' })
    }
    next(err)
  }
})

app.get('/api/groups/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { members: true },
    })
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json(group)
  } catch (err) {
    next(err)
  }
})

app.put('/api/groups/:id', async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })
  try {
    const updated = await prisma.group.update({
      where: { id },
      data: { name },
      include: { members: true },
    })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update group' })
  }
})

//
// ─── MEMBERS ───────────────────────────────────────────────────────────────────
//
app.post('/api/groups/:id/members', async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Member name is required' })
  try {
    const member = await prisma.member.create({
      data: { name, group: { connect: { id } } },
    })
    res.json(member)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add member' })
  }
})

app.patch('/api/groups/:groupId/members/:memberId', async (req, res) => {
  const { memberId } = req.params
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Member name is required' })
  try {
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { name },
    })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update member' })
  }
})

app.delete('/api/groups/:groupId/members/:memberId', async (req, res) => {
  const { memberId } = req.params
  try {
    await prisma.member.delete({ where: { id: memberId } })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete member' })
  }
})

//
// ─── USERS ─────────────────────────────────────────────────────────────────────
//
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await prisma.member.findMany({ orderBy: { name: 'asc' } })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

//
// ─── QUESTIONNAIRE ─────────────────────────────────────────────────────────────
//
app.post(
  '/api/groups/:groupId/members/:memberId/questionnaire',
  async (req, res) => {
    const { groupId, memberId } = req.params
    const {
      budget,
      tripLength,
      ecoPriority,
      interests,
      deckResponses, // newly added
    } = req.body

    if (
      budget == null ||
      tripLength == null ||
      ecoPriority == null ||
      !Array.isArray(interests) ||
      typeof deckResponses !== 'object'
    ) {
      return res
        .status(400)
        .json({ error: 'budget, tripLength, ecoPriority, interests, deckResponses are required' })
    }

    try {
      const questionnaire = await prisma.questionnaire.create({
        data: {
          budget,
          tripLength,
          ecoPriority,
          interests,
          deckResponses,
          member: { connect: { id: memberId } },
          group:  { connect: { id: groupId   } },
        },
      })
      res.json(questionnaire)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to save questionnaire' })
    }
  }
)

app.get(
  '/api/groups/:groupId/members/:memberId/questionnaire',
  async (req, res) => {
    const { groupId, memberId } = req.params
    try {
      const questionnaire = await prisma.questionnaire.findFirst({
        where: { groupId, memberId },
      })
      res.json(questionnaire || null)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to fetch questionnaire' })
    }
  }
)

//
// ─── VOTING ROUNDS & VOTES ─────────────────────────────────────────────────────
//
app.get('/api/groups/:groupId/rounds', async (req, res, next) => {
  const { groupId } = req.params
  try {
    const rounds = await prisma.votingRound.findMany({
      where: { groupId },
      orderBy: { number: 'asc' },
    })
    res.json(rounds)
  } catch (err) {
    next(err)
  }
})

app.post('/api/groups/:groupId/rounds', async (req, res, next) => {
  const { groupId } = req.params
  try {
    const last = await prisma.votingRound.findFirst({
      where: { groupId },
      orderBy: { number: 'desc' },
    })
    const nextNum = last ? last.number + 1 : 1
    const round = await prisma.votingRound.create({
      data: { group: { connect: { id: groupId } }, number: nextNum },
    })
    res.json(round)
  } catch (err) {
    next(err)
  }
})

app.get(
  '/api/groups/:groupId/rounds/:roundId/votes',
  async (req, res, next) => {
    const { roundId } = req.params
    try {
      const votes = await prisma.vote.findMany({ where: { roundId } })
      res.json(votes)
    } catch (err) {
      next(err)
    }
  }
)

app.post(
  '/api/groups/:groupId/rounds/:roundId/vote',
  async (req, res, next) => {
    const { groupId, roundId } = req.params
    const { memberId, place, value } = req.body
    if (!memberId || !place || typeof value !== 'boolean') {
      return res
        .status(400)
        .json({ error: 'memberId, place (string), and value (boolean) are required' })
    }
    try {
      const vote = await prisma.vote.upsert({
        where: { memberId_roundId_place: { memberId, roundId, place } },
        create: { memberId, groupId, roundId, place, value },
        update: { value, createdAt: new Date() },
      })
      res.json(vote)
    } catch (err) {
      next(err)
    }
  }
)

app.post(
  '/api/groups/:groupId/rounds/:roundId/close',
  async (req, res, next) => {
    const { groupId, roundId } = req.params
    try {
      const round = await prisma.votingRound.findUnique({
        where: { id: roundId },
        include: { votes: true, group: { include: { members: true } } },
      })
      if (!round) return res.status(404).json({ error: 'Round not found' })

      const places = Array.from(new Set(round.votes.map(v => v.place)))
      let winner = null

      for (let p of places) {
        const unanimous = round.group.members.every(m =>
          round.votes.some(v => v.place === p && v.memberId === m.id && v.value)
        )
        if (unanimous) {
          winner = p
          break
        }
      }

      let newStatus = 'CLOSED'
      if (!winner && round.number >= 5) {
        winner = places[Math.floor(Math.random() * places.length)]
        newStatus = 'COIN_TOSS'
      }

      const updated = await prisma.votingRound.update({
        where: { id: roundId },
        data: { status: newStatus, winner, endedAt: new Date() },
      })

      res.json({
        roundId: updated.id,
        number: updated.number,
        status: updated.status,
        winner: updated.winner,
      })
    } catch (err) {
      next(err)
    }
  }
)

// Error handler & start
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal Server Error' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`)
})
