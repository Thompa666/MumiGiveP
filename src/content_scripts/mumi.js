// @flow

import browser from 'webextension-polyfill';
import PttController from './PttController';
import Command from './Command';

type PopupResponse = {
  ok: boolean,
}

const listener = async (request) => {
  const input = document.getElementById('t');

  try {
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Could not get PTT input element!');
    }

    const controller = new PttController(input);
    const ptt = new Command(controller);

    const authorId = await ptt.parseAuthorId();
    const settings = { ...request, pttId: authorId };
    const ids = await ptt.getTargetUserIds(settings);

    const confirmRes: PopupResponse = await browser.runtime.sendMessage({
      action: 'confirmId',
      ids,
    });

    if (!confirmRes.ok) {
      return {
        success: true,
        message: '已取消發送。',
      };
    }

    const res = await ptt.mumiGiveP(ids, settings);
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
