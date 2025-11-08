import createHttpError from 'http-errors';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Subscription } from '../models/subscription.js';
import { sendSubscriptEmail } from '../utils/sendMail.js';

export const createSubscription = async (req, res, next) => {
  const { email } = req.body;

  const subscriptionExist = await Subscription.findOne({ email });

  if (subscriptionExist) {
    return next(createHttpError(409, 'Така поштова адреса вже має підписку.'));
  }

  const subscription = await Subscription.create({ email });
  res.status(201).json({
    message: 'Підписка успішно створена.',
    subscription,
  });
};

export const submitSubscription = async (req, res, next) => {
  try {
    // шукаю всіх підписників
    const subscribers = await Subscription.find({}, 'email');
    if (!subscribers.length) {
      return res.status(404).json({ message: 'Немає підписників!!!' });
    }

    const templatePath = path.resolve('src/templates/news-letter-email.html');
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    //  Посилання на сайт або  в .env
    const siteLink = process.env.SITE_URL || 'https://clothica.com';

    for (const subscriber of subscribers) {
      const html = template({
        email: subscriber.email,
        link: siteLink,
      });
      await sendSubscriptEmail({
        from: process.env.SMTP_FROM,
        to: subscriber.email,
        subject: 'Новинки у Clothica',
        html,
      });
    }

    res.status(200).json({ message: `Електронні листи надіслані для ${subscribers.length} підписників!` });
  } catch {
    next(createHttpError(500, 'Не вдалося надіслати електронні листи!'));
    return;
  }
};
