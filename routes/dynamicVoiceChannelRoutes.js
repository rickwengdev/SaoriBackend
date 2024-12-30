const express = require('express');
const DynamicVoiceChannelController = require('../controllers/dynamicVoiceChannelController');

const router = express.Router();

/**
 * 動態語音頻道路由
 * GET /api/dynamic-voice-channels
 */
router.get('/:serverId/dynamic-voice-channels', (req, res) => {
  DynamicVoiceChannelController.getDynamicVoiceChannels(req, res);
});

/**
 * 新增或更新伺服器的動態語音頻道配置
 * POST /api/dynamic-voice-channels
 */
router.post('/:serverId/dynamic-voice-channels', (req, res) => {
  DynamicVoiceChannelController.upsertDynamicVoiceChannel(req, res);
});

/**
 * 刪除伺服器的動態語音頻道配置
 * DELETE /api/dynamic-voice-channels
 */
router.delete('/:serverId/channels', (req, res) => {
  DynamicVoiceChannelController.deleteDynamicVoiceChannel(req, res);
});

module.exports = router;