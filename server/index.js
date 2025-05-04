// server/index.js

const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
  if (['POST','PUT','PATCH','DELETE'].includes(req.method)) {
    console.log(`→ ${req.method} ${req.originalUrl}`, req.body)
  } else {
    console.log(`→ ${req.method} ${req.originalUrl}`)
  }
  next()
})

// Test endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node!' })
})

//
// ─── GROUPS ────────────────────────────────────────────────────────────────────
//

// List groups, optionally filtering by memberId
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

// Create a new group with initial members
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

// Get a single group by ID
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

// Rename a group
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

// Add a member to a group
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

// Update member name or animation‐seen flag
app.patch('/api/groups/:groupId/members/:memberId', async (req, res) => {
  const { memberId } = req.params
  const { name, questionsGeneratedAnimation } = req.body

  const data = {}
  if (name != null) data.name = name
  if (questionsGeneratedAnimation != null) {
    data.questionsGeneratedAnimation = questionsGeneratedAnimation
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  try {
    const updated = await prisma.member.update({
      where: { id: memberId },
      data,
    })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update member' })
  }
})

// Remove a member
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

// List all users (members across all groups)
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

// Submit a questionnaire
app.post(
  '/api/groups/:groupId/members/:memberId/questionnaire',
  async (req, res) => {
    const { groupId, memberId } = req.params
    const {
      budget,
      tripLength,
      deckResponses,
      ecoPriority = 0,
      interests   = [],
    } = req.body

    if (
      budget == null ||
      tripLength == null ||
      typeof deckResponses !== 'object'
    ) {
      return res
        .status(400)
        .json({ error: 'budget, tripLength and deckResponses are required' })
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

// Fetch a questionnaire (returns 204 if not exists)
app.get(
  '/api/groups/:groupId/members/:memberId/questionnaire',
  async (req, res) => {
    const { groupId, memberId } = req.params
    try {
      const questionnaire = await prisma.questionnaire.findFirst({
        where: { groupId, memberId },
      })
      if (!questionnaire) {
        return res.sendStatus(204)
      }
      res.json(questionnaire)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to fetch questionnaire' })
    }
  }
)

//
// ─── VOTING ROUNDS & VOTES ─────────────────────────────────────────────────────
//

// List all rounds for a group
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

// Start a new round
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

// List votes for a round
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

// Cast or update a vote
app.post(
  '/api/groups/:groupId/rounds/:roundId/vote',
  async (req, res, next) => {
    const { groupId, roundId } = req.params
    const { memberId, place, value } = req.body
    if (!memberId || !place || typeof value !== 'boolean') {
      return res
        .status(400)
        .json({ error: 'memberId, place, and value are required' })
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

// Close a round
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

      // Gather distinct places
      const places = Array.from(new Set(round.votes.map(v => v.place)))
      let winner = null

      // Check unanimous yes
      for (let p of places) {
        if (
          round.group.members.every(m =>
            round.votes.some(v => v.place === p && v.memberId === m.id && v.value)
          )
        ) {
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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal Server Error' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`)
})
