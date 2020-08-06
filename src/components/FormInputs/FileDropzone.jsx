import React, {
  useMemo, useCallback, useState, useEffect,
} from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

const containerStyle = {
  display: 'flex',
  width: '100%',
  height: '100%',
};

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const activeStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

FileDropzone.propTypes = {
  targetText: PropTypes.string,
  infoText: PropTypes.string,
  acceptTypes: PropTypes.string,
  onFileDrop: PropTypes.func,
};

FileDropzone.defaultProps = {
  targetText: "Drag 'n' drop some files here, or click to select files",
  infoText: '',
  acceptTypes: 'image/*',
  onFileDrop: (binaryStr) => console.log('file contents as binary:', binaryStr),
};

function FileDropzone({
  targetText, infoText, acceptTypes,
  onFileDrop,
}) {
  const [errorText, setErrorText] = useState('');
  const [acceptedFileNames, setAcceptedFileNames] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setAcceptedFileNames(acceptedFiles.map((file) => file.name));
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
      // Do whatever you want with the file contents
        const binaryStr = reader.result;
        onFileDrop(binaryStr);
      };
      reader.readAsText(file);
    });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ // dropzone config
    onDrop,
    accept: acceptTypes,
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  }), [isDragActive, isDragReject, isDragAccept]);

  useEffect(() => {
    if (isDragReject && isDragActive)
      setErrorText('Invalid File Type');
    else
      setErrorText('');
  }, [isDragReject, isDragActive, setErrorText]);

  return (
    <div className={containerStyle}>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <h4>{targetText}</h4>
        <p>{infoText}</p>
        <p className="text-danger">{errorText}</p>
      </div>
      <div>
        <p>
          Selected Files:
          {' '}
          {acceptedFileNames ? acceptedFileNames.join(', ') : 'none'}
        </p>
      </div>
    </div>
  );
}

export default FileDropzone;
