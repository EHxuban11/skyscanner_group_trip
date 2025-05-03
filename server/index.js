const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node!' });
});

// List all groups
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: { members: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create a new group with members, enforcing unique group name
app.post('/api/groups', async (req, res) => {
  const { groupName, members } = req.body;
  if (!groupName || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: 'groupName and members are required' });
  }
  try {
    const group = await prisma.group.create({
      data: {
        name: groupName,
        members: { create: members.map(name => ({ name })) }
      },
      include: { members: true }
    });
    return res.json(group);
  } catch (err) {
    // Handle Prisma unique constraint error for group name
    if (err.code === 'P2002' && err.meta && err.meta.target && err.meta.target.includes('name')) {
      return res.status(400).json({ error: 'A group with that name already exists' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Failed to create group' });
  }
});

// Fetch a group by ID
app.get('/api/groups/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    return res.json(group);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch group' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`);
});
