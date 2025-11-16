import createHttpError from 'http-errors';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Subscription } from '../models/subscription.js';
import { sendMail } from '../utils/sendMail.js';

export const createSubscription = async (req, res) => {
  const { email } = req.body;

  const subscriptionExist = await Subscription.findOne({ email });

  if (subscriptionExist) {
    throw createHttpError(409, 'Така поштова адреса вже має підписку.');
  }

  const subscription = await Subscription.create({ email });
  //////////////////////////////////////////////

  // --- ДОДАНО КОД ДЛЯ НАДСИЛАННЯ ПІДТВЕРДЖУВАЛЬНОГО ЛИСТА ---

  try {
    // 1. Вказуємо шлях до шаблону підтвердження
    const templatePath = path.resolve('src/templates/subscription-confirmation.html');

    // 2. Читаємо HTML-шаблон
    const templateSource = await fs.readFile(templatePath, 'utf-8');

    // 3. Компілюємо шаблон за допомогою Handlebars
    const template = handlebars.compile(templateSource);

    // 4. Компілюємо HTML-вміст. Передаємо динамічні дані (наприклад, email)
    const html = template({
      email: email,
      // Додайте будь-які інші змінні, необхідні для цього шаблону (наприклад, посилання на відписку)
    });

    // 5. Надсилаємо лист
    await sendMail({
      from: process.env.SMTP_FROM,
      to: email, // Надсилаємо лише новому підписнику
      subject: '✅ Підтвердження підписки на розсилку Clothica',
      html,
    });
  } catch (error) {
    // Якщо надсилання листа не вдалося, реєструємо помилку, але НЕ зупиняємо створення підписки.
    // Користувач все одно підписаний, але листа не отримав.
    console.error('Помилка при надсиланні листа-підтвердження:', error);
    // Можна додати логіку для повторної спроби або сповіщення адміністратора
  }

  // -----------------------------------------------------------------------

  //////////////////////////////////////////
  res.status(201).json({
    message: 'Підписка успішно створена.',
    subscription,
  });
};

export const submitSubscription = async (req, res) => {
  const subscribers = await Subscription.find({}, 'email');
  if (!subscribers.length) {
    return res.status(404).json({ message: 'Немає підписників!!!' });
  }

  const templatePath = path.resolve('src/templates/news-litter-email.html');
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);

  const siteLink = process.env.SITE_URL || 'https://clothica-team-04-frontend.vercel.app';

  for (const subscriber of subscribers) {
    const html = template({
      email: subscriber.email,
      link: siteLink,
    });
    try {
      await sendMail({
        from: process.env.SMTP_FROM,
        to: subscriber.email,
        subject: 'Новинки у Clothica',
        html,
      });
    } catch (error) {
      console.log(error);
      throw createHttpError(500, error);
    }
  }

  res.status(200).json({ message: `Електронні листи надіслані для ${subscribers.length} підписників!` });
};
