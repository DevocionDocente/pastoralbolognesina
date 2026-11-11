import { ActivityController } from "@/modules/activities/http/activity-controller";
import { MediaController } from "@/modules/activities/http/media-controller";
import { PublicGalleryController } from "@/modules/activities/http/public-gallery-controller";
import { PublicGalleryPresenter } from "@/modules/activities/http/public-gallery-presenter";
import { SearchPresenter } from "@/modules/activities/http/search-presenter";
import { ActivityProfileController } from "@/modules/activities/http/profile-controller";
import { ProfilePresenter } from "@/modules/activities/http/profile-presenter";
import { VirtueController } from "@/modules/activities/http/virtue-controller";
import { DrizzleGalleryRepository } from "@/modules/activities/repositories/drizzle-gallery-repository";
import { DrizzleActivityRepository } from "@/modules/activities/repositories/drizzle-activity-repository";
import { DrizzleMediaRepository } from "@/modules/activities/repositories/drizzle-media-repository";
import { DrizzleSeriesRepository } from "@/modules/activities/repositories/drizzle-series-repository";
import { AudioTranscriber } from "@/modules/activities/processors/audio-transcriber";
import { DocumentProcessor } from "@/modules/activities/processors/document-processor";
import { MediaProcessorRegistry } from "@/modules/activities/processors/media-processor-registry";
import { PhotoProcessor } from "@/modules/activities/processors/photo-processor";
import { VideoProcessor } from "@/modules/activities/processors/video-processor";
import { YoutubeProcessor } from "@/modules/activities/processors/youtube-processor";
import { DrizzleAnalysisRepository } from "@/modules/activities/repositories/drizzle-analysis-repository";
import { ActivityGuard } from "@/modules/activities/services/activity-guard";
import { ActivitySummaryService } from "@/modules/activities/services/activity-summary-service";
import { AnalysisStatusService } from "@/modules/activities/services/analysis-status-service";
import { MediaAnalysisService } from "@/modules/activities/services/media-analysis-service";
import { ActivityService } from "@/modules/activities/services/activity-service";
import { MediaService } from "@/modules/activities/services/media-service";
import { MediaUrlResolver } from "@/modules/activities/services/media-url-resolver";
import { PublicGalleryService } from "@/modules/activities/services/public-gallery-service";
import { CachingQueryEmbedder } from "@/modules/activities/services/query-embedder";
import { SearchAssistant } from "@/modules/activities/services/search-assistant";
import { SearchRanker } from "@/modules/activities/services/search-ranker";
import { SearchService } from "@/modules/activities/services/search-service";
import { DrizzleSearchRepository } from "@/modules/activities/repositories/drizzle-search-repository";
import { UploadService } from "@/modules/activities/services/upload-service";
import { DrizzleProfileRepository } from "@/modules/activities/repositories/drizzle-profile-repository";
import { DrizzleVirtueRepository } from "@/modules/activities/repositories/drizzle-virtue-repository";
import { MediaClassificationService } from "@/modules/activities/services/media-classification-service";
import { PastoralProfileService } from "@/modules/activities/services/pastoral-profile-service";
import { ProfileEditorService } from "@/modules/activities/services/profile-editor-service";
import { ReflectionImageStore } from "@/modules/activities/services/reflection-image-store";
import { VirtueArtService } from "@/modules/activities/services/virtue-art-service";
import { ActivityVirtueArtService } from "@/modules/activities/services/activity-virtue-art-service";
import { VirtueCatalogService } from "@/modules/activities/services/virtue-catalog-service";
import { VirtueResolver } from "@/modules/activities/services/virtue-resolver";
import { ProfileController } from "@/modules/auth/http/profile-controller";
import { RoleController } from "@/modules/auth/http/role-controller";
import { UserController } from "@/modules/auth/http/user-controller";
import { DrizzleAccessHistoryRepository } from "@/modules/auth/repositories/drizzle-access-history-repository";
import { DrizzleRoleRepository } from "@/modules/auth/repositories/drizzle-role-repository";
import { DrizzleUserRepository } from "@/modules/auth/repositories/drizzle-user-repository";
import { DrizzleUserPermissionRepository } from "@/modules/auth/repositories/drizzle-user-permission-repository";
import { UserPermissionService } from "@/modules/auth/services/user-permission-service";
import { AccessService } from "@/modules/auth/services/access-service";
import { AuthSetupService } from "@/modules/auth/services/auth-setup-service";
import { Authorizer } from "@/modules/auth/services/authorizer";
import { ProfileService } from "@/modules/auth/services/profile-service";
import { RoleService } from "@/modules/auth/services/role-service";
import { UserDirectoryService } from "@/modules/auth/services/user-directory-service";
import { BetterAuthCredentialGateway } from "./auth/better-auth-credential-gateway";
import { createAuth, type Auth } from "./auth/create-auth";
import { OEmbedYoutubeMetadata } from "./clients/oembed-youtube-metadata";
import { S3ObjectStorage } from "./clients/s3-object-storage";
import { FfmpegVideoToolkit } from "./clients/ffmpeg-video-toolkit";
import { OfficeDocumentTextExtractor } from "./clients/office-document-text-extractor";
import { OpenAiClient } from "./clients/openai/openai-ai-client";
import { SchoolReferences } from "./clients/openai/school-references";
import { SharpThumbnailGenerator } from "./clients/sharp-thumbnail-generator";
import { YtDlpYoutubeFetcher } from "./clients/yt-dlp-youtube-fetcher";
import { createDatabase, type Database } from "./db/database";
import { env, type Environment } from "./env";
import { HealthController } from "./http/health/health-controller";
import { HttpApplication } from "./http/http-application";
import { SessionMiddleware } from "./http/middlewares/session-middleware";
import { JobBroker } from "./jobs/job-broker";
import { PgBossAnalysisQueue } from "./jobs/pg-boss-analysis-queue";
import { AnalysisWorker } from "../worker/analysis-worker";

export class Container {
  readonly db: Database;
  readonly auth: Auth;
  readonly authSetupService: AuthSetupService;
  readonly profileService: ProfileService;
  readonly userDirectoryService: UserDirectoryService;
  readonly accessService: AccessService;
  readonly roleService: RoleService;
  readonly userPermissionService: UserPermissionService;
  readonly storage: S3ObjectStorage;
  readonly activityService: ActivityService;
  readonly mediaService: MediaService;
  readonly uploadService: UploadService;
  readonly mediaUrlResolver: MediaUrlResolver;
  readonly publicGalleryService: PublicGalleryService;
  readonly publicGallery: PublicGalleryPresenter;
  readonly analysisStatusService: AnalysisStatusService;
  readonly profileEditorService: ProfileEditorService;
  readonly virtueCatalogService: VirtueCatalogService;
  readonly profilePresenter: ProfilePresenter;
  readonly analysisWorker: AnalysisWorker | null;
  readonly searchService: SearchService;
  readonly search: SearchPresenter;
  readonly http: HttpApplication;

  constructor() {
    const environment = env();
    this.db = createDatabase(environment.DATABASE_URL);
    this.auth = createAuth(this.db, environment);

    const roles = new DrizzleRoleRepository(this.db);
    const users = new DrizzleUserRepository(this.db);
    const history = new DrizzleAccessHistoryRepository(this.db);
    const credentials = new BetterAuthCredentialGateway(this.auth);

    this.authSetupService = new AuthSetupService(roles, users, credentials);
    const userPermissions = new DrizzleUserPermissionRepository(this.db);
    this.profileService = new ProfileService(users, roles, userPermissions);
    const authorizer = new Authorizer(this.profileService);
    this.userDirectoryService = new UserDirectoryService(authorizer, users, roles, history, credentials);
    this.accessService = new AccessService(authorizer, users, roles, history);
    this.roleService = new RoleService(authorizer, roles);
    this.userPermissionService = new UserPermissionService(authorizer, users, roles, userPermissions, history);

    this.storage = new S3ObjectStorage({
      endpoint: environment.S3_ENDPOINT,
      publicEndpoint: environment.S3_PUBLIC_ENDPOINT,
      region: environment.S3_REGION,
      accessKey: environment.S3_ACCESS_KEY,
      secretKey: environment.S3_SECRET_KEY,
      bucket: environment.S3_BUCKET,
    });
    const ai = environment.OPENAI_API_KEY ? this.createAiClient(environment.OPENAI_API_KEY, environment) : null;
    const jobs = new JobBroker(environment.DATABASE_URL);
    const queue = new PgBossAnalysisQueue(jobs);
    const thumbnails = new SharpThumbnailGenerator();
    const analyses = new DrizzleAnalysisRepository(this.db);
    const activities = new DrizzleActivityRepository(this.db);
    const series = new DrizzleSeriesRepository(this.db);
    const media = new DrizzleMediaRepository(this.db);
    const activityGuard = new ActivityGuard(this.profileService);
    const profiles = new DrizzleProfileRepository(this.db);
    this.activityService = new ActivityService(activityGuard, activities, series, media, this.storage, profiles, queue);
    this.mediaService = new MediaService(activityGuard, this.activityService, media, this.storage, new OEmbedYoutubeMetadata(), queue);
    this.uploadService = new UploadService(activityGuard, this.activityService, media, this.storage, thumbnails, queue);
    this.analysisStatusService = new AnalysisStatusService(activityGuard, media, analyses, queue);
    const virtues = new DrizzleVirtueRepository(this.db);
    const reflections = new ReflectionImageStore(this.storage);
    const resolver = new VirtueResolver(virtues, queue);
    this.profileEditorService = new ProfileEditorService(activityGuard, this.activityService, profiles, resolver, reflections, thumbnails, queue);
    this.virtueCatalogService = new VirtueCatalogService(authorizer, activityGuard, virtues, reflections, thumbnails, queue);
    this.analysisWorker =
      ai && environment.WORKER_ENABLED
        ? this.createAnalysisWorker(ai, environment, jobs, { activities, analyses, media, profiles, virtues, resolver, reflections, thumbnails, queue })
        : null;
    this.mediaUrlResolver = new MediaUrlResolver(this.storage);
    const gallery = new DrizzleGalleryRepository(this.db);
    this.publicGalleryService = new PublicGalleryService(gallery, media, profiles);
    const searchRepository = new DrizzleSearchRepository(this.db);
    const ranker = new SearchRanker(
      searchRepository,
      profiles,
      ai ? new CachingQueryEmbedder(ai) : null,
      new SearchAssistant(ai, { timeoutMs: environment.SEARCH_AI_TIMEOUT_MS }),
      { maxDistance: environment.SEARCH_MAX_DISTANCE },
    );
    this.searchService = new SearchService(searchRepository, gallery, profiles, ranker);
    this.profilePresenter = new ProfilePresenter(this.mediaUrlResolver);
    this.publicGallery = new PublicGalleryPresenter(this.publicGalleryService, this.mediaUrlResolver, this.profilePresenter);
    this.search = new SearchPresenter(this.searchService, this.mediaUrlResolver, this.profilePresenter);

    const session = new SessionMiddleware(this.auth);
    this.http = new HttpApplication(this.auth, [
      new HealthController(),
      new ProfileController(this.profileService, session),
      new UserController(this.userDirectoryService, this.accessService, this.userPermissionService, session),
      new RoleController(this.roleService, session),
      new ActivityController(this.activityService, session),
      new MediaController(this.mediaService, this.uploadService, this.analysisStatusService, this.mediaUrlResolver, session),
      new ActivityProfileController(this.profileEditorService, this.profilePresenter),
      new VirtueController(this.virtueCatalogService, this.profilePresenter, session),
      new PublicGalleryController(this.publicGallery, this.publicGalleryService, this.search),
    ]);
  }

  private createAiClient(apiKey: string, environment: Environment): OpenAiClient {
    return new OpenAiClient({
      apiKey,
      visionModel: environment.OPENAI_VISION_MODEL,
      transcriptionModel: environment.OPENAI_TRANSCRIPTION_MODEL,
      embeddingModel: environment.OPENAI_EMBEDDING_MODEL,
      imageModel: environment.OPENAI_IMAGE_MODEL,
    }, new SchoolReferences(environment.SCHOOL_REFERENCES_DIR));
  }

  private createAnalysisWorker(ai: OpenAiClient, environment: Environment, jobs: JobBroker, deps: WorkerDependencies): AnalysisWorker {
    const { activities, analyses, media, profiles, virtues, resolver, reflections, thumbnails, queue } = deps;
    const video = new FfmpegVideoToolkit(environment.FFMPEG_PATH, environment.FFPROBE_PATH);
    const transcriber = new AudioTranscriber(video, ai);
    const processors = new MediaProcessorRegistry([
      new PhotoProcessor(this.storage, thumbnails, ai),
      new VideoProcessor(this.storage, video, transcriber, ai),
      new YoutubeProcessor(new YtDlpYoutubeFetcher(environment.YT_DLP_PATH), transcriber, ai),
      new DocumentProcessor(this.storage, new OfficeDocumentTextExtractor(), ai),
    ]);
    return new AnalysisWorker(jobs, {
      analysis: new MediaAnalysisService(analyses, processors, ai, this.storage, thumbnails, queue),
      summaries: new ActivitySummaryService(analyses, ai, queue),
      classification: new MediaClassificationService(analyses, media, ai, queue),
      profiles: new PastoralProfileService(profiles, analyses, virtues, resolver, ai, ai, reflections, queue),
      virtueArt: new VirtueArtService(virtues, ai, ai, reflections, queue),
      activityVirtueArt: new ActivityVirtueArtService(activities, profiles, ai, reflections),
    });
  }
}

interface WorkerDependencies {
  activities: DrizzleActivityRepository;
  analyses: DrizzleAnalysisRepository;
  media: DrizzleMediaRepository;
  profiles: DrizzleProfileRepository;
  virtues: DrizzleVirtueRepository;
  resolver: VirtueResolver;
  reflections: ReflectionImageStore;
  thumbnails: SharpThumbnailGenerator;
  queue: PgBossAnalysisQueue;
}

const globalForContainer = globalThis as unknown as { container?: Container };

export function container(): Container {
  globalForContainer.container ??= new Container();
  return globalForContainer.container;
}
