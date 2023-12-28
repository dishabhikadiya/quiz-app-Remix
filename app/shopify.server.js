import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session, admin }) => {
      shopify.registerWebhooks({ session });
      const data = await admin.rest.resources.Shop.all({
        session: session,
      });
      const shop = data.data[0];
      const shopExist = await prisma.shop.findUnique({
        where: { shop: session.shop },
      });
      if (!shopExist) {
        await prisma.shop.create({
          data: {
            name: shop.name,
            shop: session.shop,
            accessToken: session.accessToken,
            countryCode: shop.country_code,
            countryName: shop.country_name,
            accessScope: session.scope,
            phone: shop.phone,
            domain: shop.domain,
            email: shop.email,
            customerEmail: shop.customer_email,
            moneyFormat: shop.money_format,
            currency: shop.currency,
            address1: shop.address1,
            address2: shop.address2,
            zip: shop.zip,
            city: shop.city,
            shopOwner: shop.shop_owner,
          },
        });
      } else {
        await prisma.shop.update({
          where: { id: shopExist.id },
          data: {
            name: shop.name,
            shop: session.shop,
            accessToken: session.accessToken,
            countryCode: shop.country_code,
            countryName: shop.country_name,
            accessScope: session.scope,
            phone: shop.phone,
            domain: shop.domain,
            email: shop.email,
            customerEmail: shop.customer_email,
            moneyFormat: shop.money_format,
            currency: shop.currency,
            address1: shop.address1,
            address2: shop.address2,
            zip: shop.zip,
            city: shop.city,
            shopOwner: shop.shop_owner,
            appStatus: "installed",
          },
        });
      }
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
