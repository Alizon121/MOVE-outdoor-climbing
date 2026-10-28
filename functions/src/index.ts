import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as logger from 'firebase-functions/logger';

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

// Placeholder for the v1.1 moderation flow: validate new edit suggestions and queue them for review.
export const onEditCreated = onDocumentCreated('edits/{editId}', (event) => {
  logger.info('Edit suggestion received', { editId: event.params.editId });
});
