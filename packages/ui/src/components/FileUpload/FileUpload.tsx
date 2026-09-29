'use client';

// The file list and the rejections come from Ark's render-prop context,
// so the wrapper renders the whole control. Ark owns the hidden
// <input type="file">, the drag-and-drop state, validation against
// accept / maxFiles / maxFileSize and the delete triggers.
import type { ReactNode } from 'react';
import {
  FileUpload as ArkFileUpload,
  type FileUploadFileError,
  type FileUploadFileRejection,
} from '@ark-ui/react';
import { File as FileIcon, Upload, X } from 'lucide-react';
import { tv } from '../../tv';
import { Alert } from '../Alert';
import { Button } from '../Button';

const fileUploadStyles = tv({
  slots: {
    root: 'flex flex-col gap-3',
    label: 'text-dense-14 font-medium base-fg-strong',
    // The same dashed frame as EmptyState; Ark marks it while a file is
    // dragged over it.
    dropzone: [
      'flex flex-col items-center gap-3 rounded-surface border border-dashed base-border-muted px-6 py-8 text-center transition-colors',
      'ark-dragging:primary-border-solid ark-dragging:primary-bg-subtle',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    dropzoneIndicator:
      'inline-flex size-12 items-center justify-center rounded-pill base-bg-muted base-fg-muted [&>svg]:size-6',
    dropzoneText: 'text-dense-14 base-fg-muted',
    itemGroup: 'flex flex-col gap-2',
    item: 'flex items-center gap-3 rounded-surface border base-border-muted p-3',
    itemPreview:
      'inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-control base-bg-muted base-fg-muted [&>svg]:size-5',
    itemPreviewImage: 'size-full object-cover',
    itemName: 'min-w-0 flex-1 truncate text-dense-14 base-fg-strong',
    itemSizeText: 'shrink-0 text-dense-14 base-fg-muted',
    itemDeleteTrigger: 'w-8 shrink-0 px-0 [&>svg]:size-4',
    clearTrigger: 'self-start',
  },
});

const styles = fileUploadStyles();

const ERROR_MESSAGES: Record<FileUploadFileError, string> = {
  TOO_MANY_FILES: 'ファイル数が上限を超えています',
  FILE_INVALID_TYPE: 'この種類のファイルは選べません',
  FILE_TOO_LARGE: 'ファイルが大きすぎます',
  FILE_TOO_SMALL: 'ファイルが小さすぎます',
  FILE_INVALID: '無効なファイルです',
  FILE_EXISTS: '同じ名前のファイルが既にあります',
};

const describeRejection = ({ file, errors }: FileUploadFileRejection) =>
  `${file.name}: ${errors.map((error) => ERROR_MESSAGES[error] ?? error).join('、')}`;

const defaultTranslations: ArkFileUpload.RootProps['translations'] = {
  dropzone: 'ファイルをここにドロップするか、選択してください',
  itemPreview: (file) => `${file.name}のプレビュー`,
  deleteFile: (file) => `${file.name}を削除`,
};

type FileUploadProps = Omit<ArkFileUpload.RootProps, 'children'> & {
  label?: ReactNode;
  // Without the dropzone only the trigger button is shown.
  dropzone?: boolean;
  // Words shown inside the dropzone; the trigger keeps its own label.
  dropzoneText?: ReactNode;
};

const Item = ({ file }: { file: File }) => (
  <ArkFileUpload.Item file={file} className={styles.item()}>
    {file.type.startsWith('image/') ? (
      <ArkFileUpload.ItemPreview
        type="image/*"
        className={styles.itemPreview()}
      >
        <ArkFileUpload.ItemPreviewImage className={styles.itemPreviewImage()} />
      </ArkFileUpload.ItemPreview>
    ) : (
      <ArkFileUpload.ItemPreview className={styles.itemPreview()}>
        <FileIcon aria-hidden="true" />
      </ArkFileUpload.ItemPreview>
    )}
    <ArkFileUpload.ItemName className={styles.itemName()} />
    <ArkFileUpload.ItemSizeText className={styles.itemSizeText()} />
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={styles.itemDeleteTrigger()}
    >
      <ArkFileUpload.ItemDeleteTrigger>
        <X aria-hidden="true" />
      </ArkFileUpload.ItemDeleteTrigger>
    </Button>
  </ArkFileUpload.Item>
);

export const FileUpload = ({
  label,
  dropzone = true,
  dropzoneText = 'ここにファイルをドロップ',
  className,
  translations,
  ...props
}: FileUploadProps) => {
  const trigger = (
    <Button asChild variant="outline" size="sm">
      <ArkFileUpload.Trigger>ファイルを選択</ArkFileUpload.Trigger>
    </Button>
  );

  return (
    <ArkFileUpload.Root
      locale="ja-JP"
      translations={{ ...defaultTranslations, ...translations }}
      className={styles.root({ className })}
      {...props}
    >
      {label !== undefined && (
        <ArkFileUpload.Label className={styles.label()}>
          {label}
        </ArkFileUpload.Label>
      )}
      {dropzone ? (
        // disableClick hands the click to the nested trigger, so the file
        // picker opens once and the dropzone is not a button in a button.
        <ArkFileUpload.Dropzone disableClick className={styles.dropzone()}>
          <span aria-hidden="true" className={styles.dropzoneIndicator()}>
            <Upload />
          </span>
          <span className={styles.dropzoneText()}>{dropzoneText}</span>
          {trigger}
        </ArkFileUpload.Dropzone>
      ) : (
        trigger
      )}
      <ArkFileUpload.Context>
        {({ acceptedFiles, rejectedFiles }) => (
          <>
            {rejectedFiles.length > 0 && (
              <Alert.Root status="error" live="polite">
                <Alert.Indicator status="error" />
                <Alert.Content>
                  <Alert.Title>追加できなかったファイルがあります</Alert.Title>
                  <Alert.Description>
                    <ul className="list-disc ps-5">
                      {rejectedFiles.map((rejection) => (
                        <li key={rejection.file.name}>
                          {describeRejection(rejection)}
                        </li>
                      ))}
                    </ul>
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
            {acceptedFiles.length > 0 && (
              <ArkFileUpload.ItemGroup className={styles.itemGroup()}>
                {acceptedFiles.map((file) => (
                  <Item key={file.name} file={file} />
                ))}
              </ArkFileUpload.ItemGroup>
            )}
            {acceptedFiles.length > 1 && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={styles.clearTrigger()}
              >
                <ArkFileUpload.ClearTrigger>
                  すべて削除
                </ArkFileUpload.ClearTrigger>
              </Button>
            )}
          </>
        )}
      </ArkFileUpload.Context>
      <ArkFileUpload.HiddenInput />
    </ArkFileUpload.Root>
  );
};
