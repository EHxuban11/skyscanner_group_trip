// server/index.js
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// ─── Logging ─────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.originalUrl}`, req.body)
  next()
})

// ─── Test ────────────────────────────────────────────────────
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node!' })
})

// ─── List all groups ──────────────────────────────────────────
app.get('/api/groups', async (req, res, next) => {
  try {
    const groups = await prisma.group.findMany({
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(groups)
  } catch (err) {
    next(err)
  }
})

// ─── Create a group ───────────────────────────────────────────
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

// ─── Fetch one group ──────────────────────────────────────────
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

// ─── Update group name ────────────────────────────────────────
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

// ─── Add a member ─────────────────────────────────────────────
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

// ─── Rename a member ──────────────────────────────────────────
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

// ─── Delete a member ──────────────────────────────────────────
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

// ─── Save questionnaire for a member in a group ───────────────
app.post('/api/groups/:groupId/members/:memberId/questionnaire', async (req, res) => {
  const { groupId, memberId } = req.params
  const { budget, tripLength, ecoPriority, interests } = req.body
  if (!budget || !tripLength || !ecoPriority || !Array.isArray(interests)) {
    return res.status(400).json({ error: 'Budget, tripLength, ecoPriority, and interests are required' })
  }
  try {
    const questionnaire = await prisma.questionnaire.create({
      data: {
        budget,
        tripLength,
        ecoPriority,
        interests,
        member: { connect: { id: memberId } },
        group: { connect: { id: groupId } },
      },
    })
    res.json(questionnaire)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save questionnaire' })
  }
})

// ─── Fetch questionnaire for a member in a group ──────────────
app.get('/api/groups/:groupId/members/:memberId/questionnaire', async (req, res) => {
  const { groupId, memberId } = req.params
  try {
    const questionnaire = await prisma.questionnaire.findFirst({
      where: {
        groupId,
        memberId,
      },
    })
    res.json(questionnaire || null)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch questionnaire' })
  }
})

// ─── Error handler & start ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal Server Error' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`)
})