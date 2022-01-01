import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useDropzone } from 'react-dropzone'
import { useCallback, useState, useEffect } from 'react'
import { AiOutlineCloudUpload } from 'react-icons/ai';
import classNames from 'classnames';
import axios from 'axios';
import Loader from "react-loader-spinner";
import { S3UploadDto } from '../models/s3-upload.dto'
import { SenseiCutoutPayload } from '../models/sensei-cutout-payload.model'
import { SenseiCutoutResponse } from '../models/sensei-cutout-response.model'

const Home: NextPage = () => {
  const [fileName, setFileName] = useState<string>('')
  const [file, setFile] = useState<any>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [cutoutURL, setCutoutURL] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [ready, setReady] = useState<boolean>(false)
  const [presignedUrlGET, setpresignedUrlGET] = useState<string>('')
  const [presignedUrlGETCutout, setpresignedUrlGETCutout] = useState<string>('')
  const [presignedUrlPOST, setpresignedUrlPOST] = useState<string>('')
  const [senseiStatusUrl, setsenseiStatusUrl] = useState<string>('')
  const [statusPollInterval, setStatusPollInterval] = useState<any>(null)

  const onDrop = useCallback(acceptedFile => {
    setFileName(acceptedFile[0].name)
    setFile(acceptedFile[0])
  }, [])

  function clearState() {
    setFileName('')
    setUploadedFileName('')
    setCutoutURL('')
    setpresignedUrlGET('')
    setpresignedUrlPOST('')
    setsenseiStatusUrl('')
    setFile(null)
    setStatusPollInterval(null)
    setIsLoading(false)
    setReady(false)
  }

  //Upload to S3
  useEffect(() => {
    if (file) {
      setIsLoading(true)
      let formData = new FormData();
      formData.append("img", file, file.name);
      console.log(file)
      axios.post<S3UploadDto>('/api/s3-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(({ data, statusText }) => {
          if (statusText === 'OK') {
            console.log(data.fileName)
            setUploadedFileName(data.fileName);
          }
        })
        .catch((err) => {
          clearState()

          console.error(err)
        })
    }

  }, [file])

  //Get presigned URL of uploaded image
  useEffect(() => {
    if (uploadedFileName !== '') {
      axios.post('/api/s3-presigned-get', {
        fileName: uploadedFileName
      })
        .then(({ data, statusText }) => {
          if (statusText === 'OK') {
            setpresignedUrlGET(data)
          }
        })
        .catch((err) => {
          console.error(err)
          clearState()

        })
    }
  }, [uploadedFileName])

  //Get presigned upload URL
  useEffect(() => {
    if (presignedUrlGET !== '') {
      axios.post('/api/s3-presigned-post', {
        fileName: uploadedFileName
      })
        .then(({ data, statusText }) => {
          if (statusText === 'OK') {
            setpresignedUrlPOST(data)
          }
        })
        .catch((err) => {
          console.error(err)
          clearState()

        })
    }
  }, [presignedUrlGET])

  //Get status URL
  useEffect(() => {
    if (presignedUrlPOST !== '' && presignedUrlGET !== '') {
      const body: SenseiCutoutPayload = {
        getUrl: presignedUrlGET || '',
        postUrl: presignedUrlPOST || ''
      }
      axios.post<SenseiCutoutResponse>('/api/adobe-sensei-cutout', body)
        .then(({ data, statusText }) => {
          if (statusText === 'OK') {
            setsenseiStatusUrl(data._links.self.href)
          }
        })
        .catch((err) => {
          console.error(err)
          clearState()

        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presignedUrlPOST])

  //Poll status URL
  useEffect(() => {
    if (senseiStatusUrl !== '') {
      const pollInterval = setInterval(() => {
        axios.post('/api/poll-status', {
          statusURL: senseiStatusUrl
        })
          .then(({ data, statusText }) => {
            if (statusText === 'OK' && data?.status === 'succeeded') {
              setReady(true);
            }
          })
          .catch((err) => {
            console.error(err)
            clearInterval(pollInterval)
            clearState()

          })
      }, 3500)
      setStatusPollInterval(pollInterval);
    }
  }, [senseiStatusUrl])

  //Get presigned URL for cutout image
  useEffect(() => {
    if (ready) {
      clearInterval(statusPollInterval)
      axios.post('/api/s3-presigned-get-cutout', {
        fileName: uploadedFileName
      })
        .then(({ data, statusText }) => {
          if (statusText === 'OK') {
            setpresignedUrlGETCutout(data);
            clearState()
          }
        })
        .catch((err) => {
          console.error(err)
          clearState()
        })
    }
  }, [ready])


  const uploadBtnClass = classNames('file-cta')
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <>
      <section className="hero gradient is-fullheight">
        <div className="hero-body">
          <div className="container is-flex is-justify-content-center is-align-items-center is-flex-direction-column">
            {
              !isLoading ?
                <div>
                  <div className="file has-name mt-5" {...getRootProps()}>
                    <label className="file-label">
                      <input className="file-input" type="file" name="img" {...getInputProps({ multiple: false })} />
                      <button className={uploadBtnClass}>
                        <span className="file-icon">
                          <AiOutlineCloudUpload />
                        </span>
                        <span className="file-label">
                          Choose a file…
                        </span>
                      </button>
                      <span className="file-name">
                        {fileName ? fileName : 'Upload your image here'}
                      </span>
                    </label>
                  </div>
                </div> : <Loader color='white' secondaryColor='white' type={'MutatingDots'} width={100} height={100} />
            }
            {
              presignedUrlGETCutout && presignedUrlGETCutout !== '' ?

                <div className="box mt-6" style={{width: '550px', height: '450px'}}>
                  <Image src={presignedUrlGETCutout} alt='image with background removed' layout='responsive' width={500} height={400} />
                </div>
                : null
            }
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
