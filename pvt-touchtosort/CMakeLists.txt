# Copyright(c) 2020 Prime Vision BV
cmake_minimum_required(VERSION 3.10.2 FATAL_ERROR)

#---------------------------------------------------------------------------------------
# Set default build to release and check not windows
#---------------------------------------------------------------------------------------
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE "Release" CACHE STRING "Choose Release or Debug" FORCE)
endif()



#---------------------------------------------------------------------------------------
# Set version
#---------------------------------------------------------------------------------------
if(NOT DEFINED CUSTOM_MAJOR_VERSION)
  set(CUSTOM_MAJOR_VERSION 0)
endif()
if(NOT DEFINED CUSTOM_MINOR_VERSION)
  set(CUSTOM_MINOR_VERSION 1)
endif()
if(NOT DEFINED CUSTOM_PATCH_VERSION)
  set(CUSTOM_PATCH_VERSION 1)
endif()

if(NOT DEFINED CUSTOM_VERSION_TWEAK)
  set(CUSTOM_VERSION_TWEAK "-unstable")
endif()


set(VERSION_STRING ${CUSTOM_MAJOR_VERSION}.${CUSTOM_MINOR_VERSION}.${CUSTOM_PATCH_VERSION})


#---------------------------------------------------------------------------------------
# Create project
#---------------------------------------------------------------------------------------
project (pvt-touchtosort VERSION ${VERSION_STRING} LANGUAGES NONE DESCRIPTION "Prime Vision Sorting GUI")


#---------------------------------------------------------------------------------------
# Build executable
#---------------------------------------------------------------------------------------
# is python file
file(GLOB_RECURSE APPCENTER_SRCS ${CMAKE_CURRENT_SOURCE_DIR}/app/*)
# write version to file
file(WRITE ${CMAKE_CURRENT_SOURCE_DIR}/app/version.py "MAJOR='${CUSTOM_MAJOR_VERSION}'\nMINOR='${CUSTOM_MINOR_VERSION}'\nPATCH='${CUSTOM_PATCH_VERSION}'\nTWEAK='${CUSTOM_TWEAK_VERSION}'")
# run pyinstaller

# Build Frontend
set(BUILD_FRONTEND ${PROJECT_SOURCE_DIR}/build/mark_build_done)

# Documentation target
add_custom_target(pvt-touchtosort ALL DEPENDS ${BUILD_FRONTEND})

add_custom_command(OUTPUT ${BUILD_FRONTEND}
                    COMMAND
                    npm install --prefix ${CMAKE_CURRENT_SOURCE_DIR}/app/frontend
                    COMMAND
                    npm run build --prefix ${CMAKE_CURRENT_SOURCE_DIR}/app/frontend
                    COMMAND
                    rm -rf ${CMAKE_CURRENT_SOURCE_DIR}/app/frontend/node_modules
                    COMMAND
                    pyinstaller main.py --onefile --add-data app/:app --distpath ${PROJECT_SOURCE_DIR}/build/dist --name pvt-touchtosort
                    # Create a file that marks the build is done
                    COMMAND 
                    ${CMAKE_COMMAND} -E touch ${BUILD_FRONTEND}
                    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
                    MAIN_DEPENDENCY ${PROJECT_SOURCE_DIR}/main.py
                    COMMENT "Generating pvt-touchtosort binary using pyinstaller"
)
#---------------------------------------------------------------------------------------
# Install directives
#--------------------------------------------------------------------------------------- 
install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/build/dist/pvt-touchtosort DESTINATION ${CMAKE_INSTALL_PREFIX}/bin/primevision PERMISSIONS OWNER_EXECUTE OWNER_WRITE OWNER_READ
GROUP_EXECUTE GROUP_READ WORLD_READ WORLD_EXECUTE COMPONENT TOUCHTOSORT)
install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/settings.json DESTINATION /var/local/${PROJECT_NAME} COMPONENT TOUCHTOSORT)
#---------------------------------------------------------------------------------------
# CPack settings
#---------------------------------------------------------------------------------------
SET(CPACK_GENERATOR "DEB")
SET(CPACK_DEBIAN_PACKAGE_MAINTAINER "Timo Thans")
SET(CPACK_PACKAGE_VENDOR "Prime Vision BV")
SET(CPACK_PACKAGE_VERSION_MAJOR ${CUSTOM_MAJOR_VERSION})
SET(CPACK_PACKAGE_VERSION_MINOR ${CUSTOM_MINOR_VERSION})
SET(CPACK_PACKAGE_VERSION_PATCH ${CUSTOM_PATCH_VERSION}${CUSTOM_VERSION_TWEAK})
SET(CPACK_PACKAGE_CHECKSUM MD5)
set(CPACK_DEB_COMPONENT_INSTALL ON)
set(CPACK_ADD_COMPONENT FRONTEND DISPLAY_NAME "pvt-touchtosort")
SET(CPACK_DEBIAN_FILE_NAME DEB-DEFAULT)
INCLUDE(CPack)




