import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Map, { Marker } from 'react-map-gl';
import styled from 'styled-components';
import * as resuableComponents from '../../reusable-components';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import {setModalInvisible, getSatellite} from '../../actions'

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MarkerButton = styled.button`
  width: 16px;
  height: 16px;
  background-color: ${({ selected }) => (selected ? 'red' : 'blue')};
  border-radius: 50%;
  border: none;
  cursor: pointer;
`;

const MapApp = () => {

  const mapboxToken = MAPBOX_ACCESS_TOKEN;
  const {ModalContainer, Modal, ModalHeader, ModalBody, IconArea, TitleContainer, IconButton, FormGroup, LabelForm} = resuableComponents;

  const dispatch = useDispatch();

  const satellites = useSelector(state => state.satellites);
  const searchQuery = useSelector(state => state.searchQuery);
  const selectedSatellite = useSelector(state => state.selectedSatellite);
  const modalVisible = useSelector(state => state.modalVisible)

  const [filteredSatellites, setFilteredSatellites] = useState([]);
  const [viewState, setViewState] = useState({
    width: '100%',
    height: '100vh',
    latitude: 0,
    longitude: 0,
    zoom: 5,
  });

  const trimedQuery = searchQuery?.toLowerCase().trim();

  useEffect(() => {
    if(trimedQuery === '') {
      setFilteredSatellites(satellites);
    } else {
      setFilteredSatellites(satellites.filter(satellite =>
        satellite.id === trimedQuery ||
        satellite.name?.toLowerCase().includes(trimedQuery) ||
        satellite.owner?.toLowerCase().includes(trimedQuery)
        )
      );
    }
    if(selectedSatellite !== null) {
      setViewState({
        ...viewState,
        latitude: selectedSatellite.latitude || 0,
        longitude: selectedSatellite.longitude || 0,
      });
    }
  }, [trimedQuery, satellites, selectedSatellite]);

  const handleMarkerClick = (satellite) => {
    dispatch(getSatellite(satellite, true));
  }

  const handleCloseClick = () => {
    dispatch(setModalInvisible());
  }

  return (
    // <div data-testid='map-container'>
      <Map
        {...viewState}
        style={{width: '100%', height: '100vh'}}
        onMove={e => setViewState(e.viewState)}
        mapStyle='mapbox://styles/mapbox/streets-v9'
        mapboxAccessToken={mapboxToken}
      >
        {filteredSatellites.map(satellite => (
          <Marker
            key={satellite.id}
            latitude={satellite.latitude}
            longitude={satellite.longitude}
          >
            <MarkerButton
              id={`marker-${satellite.id}`}
              data-testid={`marker-${satellite.id}`}
              selected={selectedSatellite === satellite}
              onClick={() => handleMarkerClick(satellite)}
            />
          </Marker>
        ))}
        {
          modalVisible && (
            <ModalContainer>
              <Modal width='300px'>
                <ModalHeader>
                  <TitleContainer>
                    Satellite Detail
                  </TitleContainer>
                  <IconButton onClick={(satellite) => handleCloseClick(satellite)}>
                    <IconArea icon = {faClose} color='#566787' />
                  </IconButton>
                </ModalHeader>
                <ModalBody>
                  <FormGroup>
                    <LabelForm>
                      Name: {selectedSatellite.name}
                    </LabelForm>
                  </FormGroup>
                  <FormGroup>
                    <LabelForm>
                      Owner: {selectedSatellite.owner}
                    </LabelForm>
                  </FormGroup>
                  <FormGroup>
                    <LabelForm>
                      Latitude: {selectedSatellite.latitude}
                    </LabelForm>
                  </FormGroup>
                  <FormGroup>
                    <LabelForm>
                      Longitude: {selectedSatellite.longitude}
                    </LabelForm>
                  </FormGroup>
                </ModalBody>
              </Modal>
            </ModalContainer>
          )
        }
      </Map>
    // </div>
  );
};

export default MapApp;