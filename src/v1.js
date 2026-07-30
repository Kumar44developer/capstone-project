const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/states', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      select: {
        id: true,
        stateCode: true,
        stateName: true
      },
      orderBy: { stateName: 'asc' }
    });

    res.json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

router.get('/states/:stateId/districts', async (req, res) => {
  try {
    const stateId = parseInt(req.params.stateId);

    const state = await prisma.state.findUnique({
      where: { id: stateId }
    });

    if (!state) {
      return res.status(404).json({ error: 'State not found' });
    }

    const districts = await prisma.district.findMany({
      where: { stateId },
      select: {
        id: true,
        districtCode: true,
        districtName: true
      },
      orderBy: { districtName: 'asc' }
    });


    res.json({
      success: true,
      state: state.stateName,
      count: districts.length,
      data: districts
    });
  } catch (err) {
    console.error('Error fetching districts:', err);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

router.get('/districts/:districtId/subdistricts', async (req, res) => {
  try {
    const districtId = parseInt(req.params.districtId);

    const district = await prisma.district.findUnique({
      where: { id: districtId },
      include: { state: true }
    });

    if (!district) {
      return res.status(404).json({ error: 'District not found' });
    }

    const subDistricts = await prisma.subDistrict.findMany({
      where: { districtId },
      select: {
        id: true,
        subDistrictCode: true,
        subDistrictName: true
      },
      orderBy: { subDistrictName: 'asc' }
    });

    res.json({
      success: true,
      district: district.districtName,
      state: district.state.stateName,
      count: subDistricts.length,
      data: subDistricts
    });
  } catch (err) {
    console.error('Error fetching sub-districts:', err);
    res.status(500).json({ error: 'Failed to fetch sub-districts' });
  }
});

router.get('/subdistricts/:subDistrictId/villages', async (req, res) => {
  try {
    const subDistrictId = parseInt(req.params.subDistrictId);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const subDistrict = await prisma.subDistrict.findUnique({
      where: { id: subDistrictId },
      include: { district: { include: { state: true } } }
    });

    if (!subDistrict) {
      return res.status(404).json({ error: 'Sub-district not found' });
    }


    const villages = await prisma.village.findMany({
      where: { subDistrictId },
      select: {
        id: true,
        villageCode: true,
        villageName: true
      },
      skip,
      take: limit,
      orderBy: { villageName: 'asc' }
    });

    const total = await prisma.village.count({
      where: { subDistrictId }
    });

    res.json({
      success: true,
      subDistrict: subDistrict.subDistrictName,
      district: subDistrict.district.districtName,
      state: subDistrict.district.state.stateName,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      data: villages
    });
  } catch (err) {
    console.error('Error fetching villages:', err);
    res.status(500).json({ error: 'Failed to fetch villages' });
  }
});

router.get('/villages/search', async (req, res) => {
  try {
    const query = req.query.q;
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        message: 'Minimum 2 characters required for search',
        data: []
      });
    }

    
    const villages = await prisma.village.findMany({
      where: {
        villageName: { 
          contains: query, 
          mode: 'insensitive' 
        }
      },
      take: limit,
      select: {
        id: true,
        villageCode: true,
        villageName: true,
        subDistrict: {
          select: {
            id: true,
            subDistrictName: true,
            district: {
              select: {
                id: true,
                districtName: true,
                state: {
                  select: {
                    id: true,
                    stateName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { villageName: 'asc' }
    });

    const formatted = villages.map(v => ({
      id: v.id,
      villageCode: v.villageCode,
      villageName: v.villageName,
      subDistrict: v.subDistrict.subDistrictName,
      district: v.subDistrict.district.districtName,
      state: v.subDistrict.district.state.stateName,
      formatted: `${v.villageName}, ${v.subDistrict.subDistrictName}, ${v.subDistrict.district.districtName}, ${v.subDistrict.district.state.stateName}, India`
    }));

    res.json({
      success: true,
      query,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('Error searching villages:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/villages/:villageId/hierarchy', async (req, res) => {
  try {
    const villageId = parseInt(req.params.villageId);

    
    const village = await prisma.village.findUnique({
      where: { id: villageId },
      include: {
        subDistrict: {
          include: {
            district: {
              include: {
                state: true
              }
            }
          }
        }
      }
    });
    
    if (!village) {
      return res.status(404).json({ error: 'Village not found' });
    }

    res.json({
      success: true,
      hierarchy: {
        state: {
          id: village.subDistrict.district.state.id,
          code: village.subDistrict.district.state.stateCode,
          name: village.subDistrict.district.state.stateName
        },
        district: {
          id: village.subDistrict.district.id,
          code: village.subDistrict.district.districtCode,
          name: village.subDistrict.district.districtName
        },
        village: {
          id: village.id,
          code: village.villageCode,
          name: village.villageName
        }
      },
    formatted: `${village.villageName}, ${village.subDistrict.subDistrictName}, ${village.subDistrict.district.districtName}, ${village.subDistrict.district.state.stateName}, India`
    });
