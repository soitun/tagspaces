/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import TsButton from '-/components/TsButton';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';

import AppConfig from '-/AppConfig';
import { getProTeaserSlides } from '-/content/ProTeaserSlides';
import { openURLExternally } from '-/services/utils-io';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Links from 'assets/links';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';

interface Props {
  open: boolean;
  slideIndex: number;
  onClose: () => void;
}

interface SlideProps {
  title: string;
  description?: '';
  ctaURL?: string;
  ctaTitle?: string;
  items?: Array<string>;
  pictureURL?: string;
  pictureShadow?: boolean;
  videoURL?: string;
  videoPosterUrl?: string;
  pictureHeight?: number;
}

function Slide(props: SlideProps) {
  const {
    title,
    description,
    ctaURL,
    ctaTitle,
    items,
    pictureURL,
    videoURL,
    videoPosterUrl,
    pictureHeight,
    pictureShadow,
  } = props;
  return (
    <div
      style={{
        padding: 15,
        textAlign: 'left',
        overflowY: 'hidden',
        overflowX: 'hidden',
      }}
    >
      <Typography
        variant="h5"
        style={{ textAlign: 'center', paddingBottom: 10 }}
      >
        {title}
      </Typography>
      {/* <div
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
        }}
      > */}
      {description && (
        <Typography variant="subtitle1">{description}</Typography>
      )}
      {items &&
        items.map((item) => (
          <Typography variant="subtitle1">&#x2605;&nbsp;{item}</Typography>
        ))}
      <Typography variant="subtitle1">&nbsp;</Typography>
      <div style={{ textAlign: 'center' }}>
        {pictureURL && (
          <a
            href="#"
            onClick={() => {
              openURLExternally(ctaURL, true);
            }}
            style={{
              paddingTop: 15,
              paddingBottom: 15,
            }}
          >
            <img
              style={{
                cursor: 'pointer',
                maxHeight: pictureHeight,
                margin: 'auto',
                display: 'block',
                boxShadow: pictureShadow
                  ? '2px 2px 13px 0 rgb(0 0 0 / 75%'
                  : 'none',
                maxWidth: '95%',
              }}
              src={pictureURL}
              alt=""
            />
          </a>
        )}
        {videoURL && (
          <video
            src={videoURL}
            poster={videoPosterUrl}
            autoPlay={true}
            loop
            controls
            style={{ width: '100%', marginBottom: 15 }}
          />
        )}
        <br />
        {/* </div> */}
        <TsButton
          onClick={() => {
            openURLExternally(Links.links.productsOverview, true);
          }}
        >
          Compare & Upgrade
        </TsButton>
        {ctaTitle && (
          <TsButton
            onClick={() => {
              openURLExternally(ctaURL, true);
            }}
            style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
          >
            {ctaTitle}
          </TsButton>
        )}
      </div>
    </div>
  );
}

function ProTeaserDialog(props: Props) {
  const { t } = useTranslation();
  //const swiperElRef = useRef(null); //<SwiperRef>
  //const slideIndex = useSelector(getProTeaserIndex);

  const slidesEN = getProTeaserSlides(t);

  const { open, onClose, slideIndex } = props;

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const slides = [];
  for (let index in slidesEN) {
    slides.push(<Slide key={index} {...slidesEN[index]} />);
  }

  const initialSlide = slideIndex && slideIndex > -1 ? Number(slideIndex) : 0;

  function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div className={className} onClick={onClick}>
        <NavigateNextIcon fontSize="large" color="primary" />
      </div>
    );
  }

  function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div className={className} onClick={onClick}>
        <NavigateBeforeIcon fontSize="large" color="primary" />
      </div>
    );
  }

  const sliderSettings = {
    className: 'center',
    centerMode: true,
    // dots: true,
    infinite: false,
    initialSlide: initialSlide,
    centerPadding: '0px',
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      keepMounted
      scroll="paper"
    >
      <TsDialogTitle
        closeButtonTestId="closeProTeaserTID"
        style={{ height: 25 }}
        onClose={onClose}
        dialogTitle={''}
      />
      <DialogContent
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <style>
          {`
            .slick-arrow {
              height: 200px;
              width: 50px;
              display: flex;
              align-items: center;
            } 
            .slick-next:before {
              content: '';
            }
            .slick-prev:before {
              content: '';
            }
        `}
        </style>
        <Slider {...sliderSettings}>{slides}</Slider>
      </DialogContent>
    </Dialog>
  );
}

export default ProTeaserDialog;
