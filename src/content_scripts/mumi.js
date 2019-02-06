const browser = require('webextension-polyfill');
const PttController = require('./PttController');
const Command = require('./Command');

const getPttIntput = () => document.getElementById('t');

const listener = async (request) => {
  const input = getPttIntput();

  try {
    if (!input) {
      throw new Error('Could not get PTT input element!');
    }

    const controller = new PttController(input);
    const ptt = new Command(controller);

    const ids = await ptt.getTargetUserIds(request);

    const confirmRes = await browser.runtime.sendMessage({
      action: 'confirmId',
      ids,
    });

    if (!confirmRes.ok) {
      return {
        success: true,
        message: '已取消發送。',
      };
    }

    const res = await ptt.mumiGiveP(ids, request);
    if (res.success) {
      return {
        success: true,
        message: '已發送完成。',
      };
    }
    throw new Error('Unknown fail');
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

browser.runtime.onMessage.addListener(listener);
