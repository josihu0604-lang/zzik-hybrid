import { z } from 'zod';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Settings API - 사용자 설정
 *
 * GET: 현재 설정 조회
 * PUT: 설정 업데이트
 *
 * Settings:
 * - Notification preferences (push, email, marketing)
 * - Privacy settings (location, data collection)
 * - App preferences (language, theme)
 */

// ============================================================================
// SCHEMAS
// ============================================================================

const SettingsSchema = z.object({
  notifications: z
    .object({
      push: z.boolean().optional(),
      email: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
  privacy: z
    .object({
      locationServices: z.boolean().optional(),
      dataCollection: z.boolean().optional(),
    })
    .optional(),
  app: z
    .object({
      language: z.enum(['ko', 'en', 'ja', 'zh']).optional(),
      theme: z.enum(['dark', 'light', 'system']).optional(),
    })
    .optional(),
});

type Settings = z.infer<typeof SettingsSchema>;

// Default settings
const DEFAULT_SETTINGS: Required<Settings> = {
  notifications: {
    push: true,
    email: false,
    marketing: false,
  },
  privacy: {
    locationServices: true,
    dataCollection: true,
  },
  app: {
    language: 'ko',
    theme: 'dark',
  },
};

// ============================================================================
// GET - Fetch user settings
// ============================================================================

export const GET = withMiddleware(
  async () => {
    try {
      if (!isSupabaseConfigured()) {
        logger.warn('[Settings] Supabase not configured, returning defaults');
        return apiSuccess(DEFAULT_SETTINGS);
      }

      const supabase = await createAdminClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return apiError('Authentication required', 401);
      }

      // Fetch user settings
      const { data: settings, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (user has no settings yet)
        logger.error('[Settings] Fetch error', { error: fetchError });
        return apiError('Failed to fetch settings', 500);
      }

      // Return settings or defaults
      const userSettings: Settings = {
        notifications: {
          push: settings?.push_notifications ?? DEFAULT_SETTINGS.notifications.push,
          email: settings?.email_notifications ?? DEFAULT_SETTINGS.notifications.email,
          marketing: settings?.marketing_notifications ?? DEFAULT_SETTINGS.notifications.marketing,
        },
        privacy: {
          locationServices:
            settings?.location_services ?? DEFAULT_SETTINGS.privacy.locationServices,
          dataCollection: settings?.data_collection ?? DEFAULT_SETTINGS.privacy.dataCollection,
        },
        app: {
          language: settings?.language ?? DEFAULT_SETTINGS.app.language,
          theme: settings?.theme ?? DEFAULT_SETTINGS.app.theme,
        },
      };

      return apiSuccess(userSettings);
    } catch (error) {
      logger.error('[Settings] Get error', { error });
      return apiError('Internal server error', 500);
    }
  },
  { requireAuth: true }
);

// ============================================================================
// PUT - Update user settings
// ============================================================================

export const PUT = withMiddleware(
  async (request) => {
    try {
      const body = await request.json();
      const validatedSettings = SettingsSchema.parse(body);

      if (!isSupabaseConfigured()) {
        logger.warn('[Settings] Supabase not configured, returning success');
        return apiSuccess({
          message: 'Settings updated',
          settings: { ...DEFAULT_SETTINGS, ...validatedSettings },
        });
      }

      const supabase = await createAdminClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return apiError('Authentication required', 401);
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (validatedSettings.notifications) {
        if (validatedSettings.notifications.push !== undefined) {
          updateData.push_notifications = validatedSettings.notifications.push;
        }
        if (validatedSettings.notifications.email !== undefined) {
          updateData.email_notifications = validatedSettings.notifications.email;
        }
        if (validatedSettings.notifications.marketing !== undefined) {
          updateData.marketing_notifications = validatedSettings.notifications.marketing;
        }
      }

      if (validatedSettings.privacy) {
        if (validatedSettings.privacy.locationServices !== undefined) {
          updateData.location_services = validatedSettings.privacy.locationServices;
        }
        if (validatedSettings.privacy.dataCollection !== undefined) {
          updateData.data_collection = validatedSettings.privacy.dataCollection;
        }
      }

      if (validatedSettings.app) {
        if (validatedSettings.app.language !== undefined) {
          updateData.language = validatedSettings.app.language;
        }
        if (validatedSettings.app.theme !== undefined) {
          updateData.theme = validatedSettings.app.theme;
        }
      }

      // Upsert settings
      const { error: upsertError } = await supabase.from('user_settings').upsert(updateData, {
        onConflict: 'user_id',
      });

      if (upsertError) {
        logger.error('[Settings] Upsert error', { error: upsertError });
        return apiError('Failed to update settings', 500);
      }

      logger.info('[Settings] Updated successfully', { userId: user.id });

      return apiSuccess({
        message: 'Settings updated',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError('Invalid settings data', 400);
      }
      logger.error('[Settings] Put error', { error });
      return apiError('Internal server error', 500);
    }
  },
  { requireAuth: true }
);
